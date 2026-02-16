#!/usr/bin/env python3
"""
YOLOv8 + 回归头模型设计
"""

import os
import sys
from ultralytics import YOLO
from ultralytics.nn.modules import Detect
import torch
import torch.nn as nn

class YOLOv8WithRegression(YOLO):
    """
    带有回归头的YOLOv8模型
    用于同时进行目标检测和质量评分
    """
    
    def __init__(self, model='yolov8n.pt', task=None, verbose=False):
        super().__init__(model=model, task=task, verbose=verbose)
        self.add_regression_head()
    
    def add_regression_head(self):
        """
        添加回归头用于质量评分
        """
        # 检查是否已经添加了回归头
        if hasattr(self.model.model, 'regression_head'):
            return
        
        # 获取模型的最后一个特征提取层
        # 通常是在Detect头之前的层
        feature_extractor = self.model.model[:-1]
        
        # 获取特征图的通道数（假设最后一个特征图的通道数）
        # 对于YOLOv8n，通常是1280
        in_channels = 1280
        
        # 创建回归头
        # 用于预测0-100的质量评分
        regression_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(in_channels, 256),
            nn.SiLU(),
            nn.Linear(256, 128),
            nn.SiLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()  # 输出0-1，后续乘以100得到0-100分
        )
        
        # 将回归头添加到模型
        self.model.model.regression_head = regression_head
        
        print("✅ 回归头添加成功")
    
    def forward(self, x, augment=False, profile=False, visualize=False):
        """
        前向传播
        """
        # 原始的前向传播
        results = super().forward(x, augment=augment, profile=profile, visualize=visualize)
        
        # 处理回归头的输出
        if isinstance(x, torch.Tensor):
            # 获取特征图
            features = self.model.model[:-1](x)
            # 获取最后一个特征图
            last_feature = features[-1]
            # 通过回归头
            if hasattr(self.model.model, 'regression_head'):
                regression_output = self.model.model.regression_head(last_feature)
                # 将0-1映射到0-100
                quality_score = regression_output * 100
                # 添加到结果中
                if isinstance(results, list):
                    for result in results:
                        result.quality_score = quality_score
        
        return results

def create_model():
    """
    创建YOLOv8 + 回归头模型
    """
    print("创建YOLOv8 + 回归头模型...")
    
    # 加载YOLOv8n模型
    model = YOLOv8WithRegression('yolov8n.pt')
    
    print("✅ 模型创建成功")
    print("模型结构:")
    print(model.model)
    
    return model

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    model = create_model()
