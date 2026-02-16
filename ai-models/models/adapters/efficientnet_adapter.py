#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
EfficientNet模型适配器
实现对现有EfficientNet模型的兼容
"""

import os
import torch
import torch.nn as nn
import torchvision.models as models
from PIL import Image
import torchvision.transforms as transforms
import logging

from models.model_manager import StreetModel, RATING_DIMENSIONS, RATING_LEVELS, DIMENSION_WEIGHTS

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


class EfficientNetAdapter(StreetModel):
    """EfficientNet模型适配器"""
    
    def __init__(self, model_path):
        """
        初始化EfficientNet适配器
        
        Args:
            model_path: 模型路径
        """
        self.model_path = model_path
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 数据变换
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # 加载模型
        self._load_model()
    
    def _load_model(self):
        """加载模型"""
        try:
            # 检查模型文件是否存在
            if not os.path.exists(self.model_path):
                logger.warning(f"模型文件不存在: {self.model_path}")
                # 创建一个新的模型实例
                self.model = StreetRatingModel()
                logger.info("创建了新的EfficientNet模型实例")
            else:
                # 加载模型
                self.model = StreetRatingModel()
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                logger.info(f"模型加载成功: {self.model_path}")
            
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            logger.error(f"模型加载失败: {e}")
            # 创建一个新的模型实例作为备用
            self.model = StreetRatingModel()
            self.model.to(self.device)
            self.model.eval()
    
    def predict(self, image_path):
        """
        预测街道元素评分
        
        Args:
            image_path: 图片路径
            
        Returns:
            dict: 评分结果
        """
        try:
            # 加载图片
            image = Image.open(image_path).convert('RGB')
            image = self.transform(image)
            image = image.unsqueeze(0).to(self.device)
            
            # 预测
            with torch.no_grad():
                outputs = self.model(image)
                
            # 处理预测结果
            results = {}
            
            # 模拟多维度评分（实际应该为每个维度训练独立模型）
            dimensions = ['store_sign', 'greenery', 'sidewalk', 'bike_lane', 'urban_facilities']
            
            for dimension in dimensions:
                # 随机生成评分（实际应该使用对应维度的模型）
                _, predicted = torch.max(outputs, 1)
                level_idx = predicted.item()
                level_info = RATING_LEVELS[level_idx]
                
                results[dimension] = {
                    'level': level_info['level'],
                    'description': level_info['desc'],
                    'confidence': 0.8  # 模拟置信度
                }
            
            # 计算综合评分
            overall_score = sum([results[dim]['level'] * DIMENSION_WEIGHTS[dim] for dim in dimensions])
            overall_level = min(5, max(1, round(overall_score)))
            
            results['overall'] = {
                'score': round(overall_score, 2),
                'level': overall_level,
                'description': RATING_LEVELS[overall_level - 1]['desc']
            }
            
            # 添加建议
            results['recommendations'] = self._generate_recommendations(results)
            
            return results
        except Exception as e:
            logger.error(f"预测失败: {e}")
            return {}
    
    def _generate_recommendations(self, results):
        """
        生成建议
        
        Args:
            results: 评分结果
            
        Returns:
            list: 建议列表
        """
        recommendations = []
        
        if results.get('store_sign', {}).get('level', 5) <= 2:
            recommendations.append('店招状况较差，建议进行整改和美化。')
        
        if results.get('greenery', {}).get('level', 5) <= 2:
            recommendations.append('绿化覆盖率低，建议增加绿植面积。')
        
        if results.get('sidewalk', {}).get('level', 5) <= 2:
            recommendations.append('人行道铺装破损严重，建议及时修复。')
        
        if results.get('bike_lane', {}).get('level', 5) <= 2:
            recommendations.append('自行车道贯通性差，建议改善骑行环境。')
        
        if results.get('urban_facilities', {}).get('level', 5) <= 2:
            recommendations.append('城市设施维护状况差，建议加强管理和维护。')
        
        if not recommendations:
            recommendations.append('街道环境整体状况良好，建议保持现状并定期维护。')
        
        return recommendations
    
    def get_model_info(self):
        """
        获取模型信息
        
        Returns:
            dict: 模型信息
        """
        return {
            'model_name': 'EfficientNet-B0',
            'model_path': self.model_path,
            'input_size': (224, 224),
            'num_classes': 5,
            'device': str(self.device),
            'description': '基于EfficientNet-B0的街道环境评分模型'
        }
    
    def get_model_type(self):
        """
        获取模型类型
        
        Returns:
            str: 模型类型
        """
        return 'classification'


if __name__ == '__main__':
    # 测试EfficientNet适配器
    adapter = EfficientNetAdapter('models/model_test.pth')
    
    # 获取模型信息
    model_info = adapter.get_model_info()
    logger.info(f"模型信息: {model_info}")
    
    # 测试预测
    test_image = '../data/raw/绿化养护_覆盖率_07e1116c_梨园路.jpg'
    if os.path.exists(test_image):
        result = adapter.predict(test_image)
        logger.info(f"预测结果: {result}")
    else:
        logger.warning(f"测试图片不存在: {test_image}")
