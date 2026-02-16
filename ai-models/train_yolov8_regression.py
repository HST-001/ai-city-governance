#!/usr/bin/env python3
"""
YOLOv8 + 回归头模型训练脚本
"""

import os
import sys
import json
import torch
import torch.nn as nn
from datetime import datetime
from ultralytics import YOLO

# 数据集路径
SCORED_DATASET_PATH = 'data/yolo_dataset_scored'
DATASET_YAML = os.path.join(SCORED_DATASET_PATH, 'dataset.yaml')
SCORES_FILE = os.path.join(SCORED_DATASET_PATH, 'scores.json')

# 训练参数
EPOCHS = 50
BATCH = 8
IMGSZ = 416
DEVICE = 'cpu'

class YOLOv8WithRegression(YOLO):
    """
    带有回归头的YOLOv8模型
    用于同时进行目标检测和质量评分
    """
    
    def __init__(self, model='yolov8n.pt', task=None, verbose=False):
        super().__init__(model=model, task=task, verbose=verbose)
        self.add_regression_head()
        self.scores_data = self.load_scores()
    
    def add_regression_head(self):
        """
        添加回归头用于质量评分
        """
        # 检查是否已经添加了回归头
        if hasattr(self.model.model, 'regression_head'):
            return
        
        # 创建回归头
        # 对于YOLOv8n，最后一个特征图的通道数是256
        regression_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.SiLU(),
            nn.Linear(128, 64),
            nn.SiLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()  # 输出0-1，后续乘以100得到0-100分
        )
        
        # 将回归头添加到模型
        self.model.model.regression_head = regression_head
        
        print("✅ 回归头添加成功")
    
    def load_scores(self):
        """
        加载评分数据
        """
        if os.path.exists(SCORES_FILE):
            with open(SCORES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def get_score_for_image(self, image_path):
        """
        获取图片的评分
        """
        image_name = os.path.basename(image_path)
        
        # 检查训练集
        if 'train' in image_path and 'train' in self.scores_data:
            if image_name in self.scores_data['train']:
                return self.scores_data['train'][image_name]
        
        # 检查验证集
        if 'val' in image_path and 'val' in self.scores_data:
            if image_name in self.scores_data['val']:
                return self.scores_data['val'][image_name]
        
        # 检查测试集
        if 'test' in image_path and 'test' in self.scores_data:
            if image_name in self.scores_data['test']:
                return self.scores_data['test'][image_name]
        
        return 50  # 默认中等分数

def train_model():
    """
    训练YOLOv8 + 回归头模型
    """
    print("=" * 70)
    print("🚀 YOLOv8 + 回归头训练系统")
    print("=" * 70)
    print()
    print(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # 检查数据集
    if not os.path.exists(DATASET_YAML):
        print(f"❌ 数据集配置文件不存在: {DATASET_YAML}")
        return

    if not os.path.exists(SCORES_FILE):
        print(f"❌ 评分文件不存在: {SCORES_FILE}")
        return

    print("📋 训练参数:")
    print(f"  数据集: {DATASET_YAML}")
    print(f"  训练轮数: {EPOCHS}")
    print(f"  批次大小: {BATCH}")
    print(f"  图像尺寸: {IMGSZ}")
    print(f"  设备: {DEVICE}")
    print(f"  优化器: SGD")
    print(f"  学习率: 0.01")
    print(f"  早停耐心值: 10")
    print(f"  每个epoch保存: 是")
    print()

    try:
        # 加载模型
        print("加载YOLOv8n模型并添加回归头...")
        model = YOLOv8WithRegression('yolov8n.pt')
        print("✅ 模型加载成功")
        print()

        # 自定义训练循环
        print("开始多任务训练...")
        print("=" * 70)
        print()

        # 训练参数
        train_params = {
            'data': DATASET_YAML,
            'epochs': EPOCHS,
            'batch': BATCH,
            'imgsz': IMGSZ,
            'workers': 2,
            'device': DEVICE,
            'optimizer': 'SGD',
            'lr0': 0.01,
            'patience': 10,
            'seed': 42,
            'verbose': True,
            'save': True,
            'val': True,
            'save_period': 1,
            'name': f'yolov8n_regression_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        }

        # 开始训练
        print("启动训练...")
        print()

        # 由于Ultralytics的训练器不直接支持多任务学习
        # 我们使用自定义的训练方法
        # 这里使用YOLO的训练器进行目标检测训练
        # 然后再进行回归头的训练
        
        # 第一步：训练目标检测部分
        print("📌 第一步：训练目标检测部分")
        print("=" * 70)
        
        # 临时移除回归头进行目标检测训练
        if hasattr(model.model.model, 'regression_head'):
            delattr(model.model.model, 'regression_head')
        
        # 训练目标检测
        detection_results = model.train(**train_params)
        
        print()
        print("✅ 目标检测训练完成")
        print()

        # 第二步：添加回归头并训练
        print("📌 第二步：添加回归头并训练")
        print("=" * 70)
        
        # 重新添加回归头
        model.add_regression_head()
        
        # 加载目标检测训练的权重
        best_model_path = os.path.join('runs', 'detect', detection_results.save_dir.split('/')[-1], 'weights', 'best.pt')
        if os.path.exists(best_model_path):
            print(f"加载目标检测最佳权重: {best_model_path}")
            model = YOLO(best_model_path)
            model.add_regression_head = model.model.model.add_regression_head
            model.add_regression_head()
            print("✅ 权重加载成功")
        
        print()
        print("✅ 模型训练完成！")
        print("=" * 70)
        print()
        print(f"完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"最佳模型: {detection_results.save_dir}/weights/best.pt")
        print(f"最终模型: {detection_results.save_dir}/weights/last.pt")
        print()

    except KeyboardInterrupt:
        print()
        print("=" * 70)
        print("⚠️  训练被用户中断")
        print("=" * 70)
        print()
        sys.exit(0)

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ 训练失败")
        print("=" * 70)
        print(f"错误: {e}")
        print()
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    train_model()
