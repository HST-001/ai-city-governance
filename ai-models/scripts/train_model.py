#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
模型训练脚本 - 支持多维度独立模型训练
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import logging
import json
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StreetRatingModel(nn.Module):
    """单维度街道评分模型"""
    def __init__(self, num_classes=5):
        super(StreetRatingModel, self).__init__()
        # 使用预训练的EfficientNet-B0作为基础特征提取器
        self.backbone = models.efficientnet_b0(pretrained=True)
        
        # 替换最后的全连接层
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(num_features, num_classes)
        )
    
    def forward(self, x):
        output = self.backbone(x)
        return output

class StreetRatingDataset(Dataset):
    """街道评分数据集"""
    def __init__(self, dataset_path, dimension, transform=None):
        self.dataset_path = dataset_path
        self.dimension = dimension
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        # 加载数据集
        self._load_dataset()
    
    def _load_dataset(self):
        # 简单实现：遍历目录下的所有图片
        if not os.path.exists(self.dataset_path):
            logger.warning(f"数据集路径不存在: {self.dataset_path}")
            return
        
        for root, dirs, files in os.walk(self.dataset_path):
            for file in files:
                if file.endswith(('.jpg', '.jpeg', '.png')):
                    image_path = os.path.join(root, file)
                    self.image_paths.append(image_path)
                    # 模拟标签 (1-5分)
                    self.labels.append(torch.randint(1, 6, (1,)).item())
        
        logger.info(f"加载了 {len(self.image_paths)} 张图片用于{self.dimension}维度训练")
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx] - 1  # 转换为0-4的标签
        
        try:
            image = Image.open(image_path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            logger.error(f"加载图片失败: {image_path}, 错误: {e}")
            # 返回一个默认图片和标签
            default_image = torch.zeros(3, 224, 224)
            default_label = 2  # 3分
            return default_image, default_label

class ModelTrainer:
    """模型训练器"""
    def __init__(self, dimension):
        # 初始化模型
        self.dimension = dimension
        self.model = StreetRatingModel()
        # 配置
        self.config = {
            'epochs': 50,
            'batch_size': 8,
            'learning_rate': 0.0001,
            'early_stopping_patience': 10
        }
        # 损失函数
        self.criterion = nn.CrossEntropyLoss()
        # 优化器
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.config['learning_rate'])
        # 学习率调度器
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.1, patience=5
        )
        # 数据变换
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        # 验证数据变换
        self.val_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def train(self, train_data_path, val_data_path=None):
        """训练模型"""
        # 创建数据集
        train_dataset = StreetRatingDataset(train_data_path, self.dimension, transform=self.transform)
        train_dataloader = DataLoader(train_dataset, batch_size=self.config['batch_size'], shuffle=True)
        
        val_dataset = None
        val_dataloader = None
        if val_data_path:
            val_dataset = StreetRatingDataset(val_data_path, self.dimension, transform=self.val_transform)
            val_dataloader = DataLoader(val_dataset, batch_size=self.config['batch_size'], shuffle=False)
        
        # 训练循环
        best_val_loss = float('inf')
        early_stopping_counter = 0
        
        for epoch in range(self.config['epochs']):
            # 训练一个epoch
            train_loss, train_acc = self._train_one_epoch(epoch, train_dataloader)
            
            # 验证
            val_loss, val_acc = 0, 0
            if val_dataloader:
                val_loss, val_acc = self._validate(val_dataloader)
                
                # 学习率调度
                self.scheduler.step(val_loss)
                
                # 早停检查
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    early_stopping_counter = 0
                    # 保存最佳模型
                    self._save_model(epoch, val_loss, val_acc)
                else:
                    early_stopping_counter += 1
                    if early_stopping_counter >= self.config['early_stopping_patience']:
                        logger.info(f"早停触发，停止训练")
                        break
            
            logger.info(f"Epoch {epoch+1}/{self.config['epochs']} - "
                        f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f} - "
                        f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
        
        return best_val_loss
    
    def _train_one_epoch(self, epoch, dataloader):
        """训练一个epoch"""
        self.model.train()
        total_loss = 0
        correct_predictions = 0
        total_predictions = 0
        
        for batch_idx, (images, labels) in enumerate(dataloader):
            self.optimizer.zero_grad()
            
            # 前向传播
            outputs = self.model(images)
            
            # 计算损失
            loss = self.criterion(outputs, labels)
            
            # 反向传播
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            
            # 计算准确率
            _, predicted = torch.max(outputs, 1)
            correct_predictions += (predicted == labels).sum().item()
            total_predictions += len(images)
        
        avg_loss = total_loss / len(dataloader) if dataloader else 0
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        
        return avg_loss, accuracy
    
    def _validate(self, dataloader):
        """验证模型"""
        self.model.eval()
        total_loss = 0
        correct_predictions = 0
        total_predictions = 0
        
        with torch.no_grad():
            for batch_idx, (images, labels) in enumerate(dataloader):
                outputs = self.model(images)
                
                loss = self.criterion(outputs, labels)
                total_loss += loss.item()
                
                _, predicted = torch.max(outputs, 1)
                correct_predictions += (predicted == labels).sum().item()
                total_predictions += len(images)
        
        avg_loss = total_loss / len(dataloader) if dataloader else 0
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        
        return avg_loss, accuracy
    
    def _save_model(self, epoch, val_loss, val_acc):
        """保存模型"""
        model_dir = os.path.join('models', self.dimension)
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = os.path.join(model_dir, f'{self.dimension}_model.pth')
        torch.save({
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'val_loss': val_loss,
            'val_acc': val_acc
        }, model_path)
        
        logger.info(f"模型保存成功: {model_path}")

if __name__ == '__main__':
    # 训练配置
    dimensions = ['store_sign', 'greenery', 'sidewalk', 'bike_lane', 'urban_facilities']
    train_data_path = '../data/raw'
    
    # 为每个维度训练独立模型
    for dimension in dimensions:
        logger.info(f"开始训练 {dimension} 维度模型")
        trainer = ModelTrainer(dimension)
        best_loss = trainer.train(train_data_path)
        logger.info(f"{dimension} 维度模型训练完成，最佳验证损失: {best_loss:.4f}")
        logger.info("=" * 80)
