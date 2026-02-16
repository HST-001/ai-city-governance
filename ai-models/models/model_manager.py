#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
模型抽象层和管理系统
实现模型的统一接口和管理
"""

import os
import json
import logging
from abc import ABC, abstractmethod

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class StreetModel(ABC):
    """模型抽象接口"""
    
    @abstractmethod
    def predict(self, image_path):
        """
        预测街道元素评分
        
        Args:
            image_path: 图片路径
            
        Returns:
            dict: 评分结果，格式与现有系统兼容
        """
        pass
    
    @abstractmethod
    def get_model_info(self):
        """
        获取模型信息
        
        Returns:
            dict: 模型信息
        """
        pass
    
    @abstractmethod
    def get_model_type(self):
        """
        获取模型类型
        
        Returns:
            str: 模型类型
        """
        pass


class ModelManager:
    """模型管理器"""
    
    def __init__(self):
        # 模型配置
        self.models = {}
        self.default_model = None
        self.model_config = {
            'resnet18': {
                'name': 'ResNet18',
                'type': 'classification',
                'path': 'models/model_test.pth'
            },
            'efficientnet': {
                'name': 'EfficientNet-B0',
                'type': 'classification',
                'path': 'models/model_test.pth'
            },
            'yolov8': {
                'name': 'YOLOv8',
                'type': 'detection',
                'path': 'models/yolov8/best.pt'
            }
        }
        
        # 加载默认模型
        self._load_default_model()
    
    def _load_default_model(self):
        """加载默认模型"""
        # 优先使用yolov8，如果不存在则使用efficientnet
        if os.path.exists(self.model_config['yolov8']['path']):
            self.default_model = 'yolov8'
            logger.info("默认模型设置为: YOLOv8")
        else:
            self.default_model = 'efficientnet'
            logger.info("默认模型设置为: EfficientNet-B0")
    
    def load_model(self, model_name):
        """
        加载指定模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            StreetModel: 模型实例
        """
        if model_name not in self.model_config:
            logger.error(f"模型不存在: {model_name}")
            return None
        
        # 检查模型是否已加载
        if model_name in self.models:
            return self.models[model_name]
        
        # 加载模型
        try:
            if model_name == 'yolov8':
                from models.adapters.yolov8_adapter import YOLOv8Adapter
                model = YOLOv8Adapter(self.model_config['yolov8']['path'])
            elif model_name == 'efficientnet':
                from models.adapters.efficientnet_adapter import EfficientNetAdapter
                model = EfficientNetAdapter(self.model_config['efficientnet']['path'])
            elif model_name == 'resnet18':
                from models.adapters.resnet18_adapter import ResNet18Adapter
                model = ResNet18Adapter(self.model_config['resnet18']['path'])
            else:
                logger.error(f"不支持的模型类型: {model_name}")
                return None
            
            self.models[model_name] = model
            logger.info(f"模型加载成功: {model_name}")
            return model
        except Exception as e:
            logger.error(f"模型加载失败: {model_name}, 错误: {e}")
            return None
    
    def predict(self, image_path, model_name=None):
        """
        使用指定模型预测
        
        Args:
            image_path: 图片路径
            model_name: 模型名称，默认使用默认模型
            
        Returns:
            dict: 评分结果
        """
        model_name = model_name or self.default_model
        
        # 加载模型
        model = self.load_model(model_name)
        if not model:
            # 模型加载失败，尝试使用备用模型
            fallback_model = 'efficientnet' if model_name != 'efficientnet' else 'resnet18'
            logger.warning(f"{model_name} 模型加载失败，尝试使用 {fallback_model} 作为备用")
            model = self.load_model(fallback_model)
            if not model:
                logger.error("所有模型加载失败")
                return {}
        
        # 执行预测
        try:
            result = model.predict(image_path)
            # 添加模型信息
            result['model_info'] = {
                'model_name': model_name,
                'model_type': model.get_model_type(),
                'model_info': model.get_model_info()
            }
            return result
        except Exception as e:
            logger.error(f"预测失败: {e}")
            # 预测失败，返回空结果
            return {}
    
    def switch_model(self, model_name):
        """
        切换默认模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            bool: 是否切换成功
        """
        if model_name in self.model_config:
            # 验证模型是否存在
            if model_name != 'yolov8' or os.path.exists(self.model_config['yolov8']['path']):
                self.default_model = model_name
                logger.info(f"默认模型切换为: {model_name}")
                return True
            else:
                logger.error(f"模型文件不存在: {self.model_config['yolov8']['path']}")
                return False
        else:
            logger.error(f"模型不存在: {model_name}")
            return False
    
    def get_default_model(self):
        """
        获取当前默认模型
        
        Returns:
            str: 默认模型名称
        """
        return self.default_model
    
    def get_available_models(self):
        """
        获取可用模型列表
        
        Returns:
            list: 可用模型列表
        """
        available_models = []
        for model_name, config in self.model_config.items():
            if model_name == 'yolov8':
                if os.path.exists(config['path']):
                    available_models.append(model_name)
            else:
                # 对于分类模型，只要配置存在就认为可用
                available_models.append(model_name)
        return available_models


# 模型维度映射
RATING_DIMENSIONS = {
    'store_sign': {
        'name': '店招/建筑',
        'subdimensions': ['色彩', '样式', '整洁度', '安全性', '合规性', '夜间效果']
    },
    'greenery': {
        'name': '绿化',
        'subdimensions': ['管养水平', '覆盖度', '观赏性', '遮阴性', '生态性']
    },
    'sidewalk': {
        'name': '人行道',
        'subdimensions': ['铺装破损度', '整洁度', '无障碍友好性', '连续性', '宽度合理性', '排水系统', '夜间照明']
    },
    'bike_lane': {
        'name': '非机动车道',
        'subdimensions': ['有无', '安全性', '连续性', '自行车停放设置']
    },
    'urban_facilities': {
        'name': '城市设施',
        'subdimensions': ['有无', '维护状况', '色彩样式', '功能性']
    }
}


# 等级映射
RATING_LEVELS = {
    0: {'level': 1, 'desc': '差'},
    1: {'level': 2, 'desc': '较差'},
    2: {'level': 3, 'desc': '一般'},
    3: {'level': 4, 'desc': '良好'},
    4: {'level': 5, 'desc': '优秀'}
}


# 权重配置
DIMENSION_WEIGHTS = {
    'store_sign': 0.2,
    'greenery': 0.2,
    'sidewalk': 0.2,
    'bike_lane': 0.2,
    'urban_facilities': 0.2
}


if __name__ == '__main__':
    # 测试模型管理器
    manager = ModelManager()
    
    # 获取可用模型
    available_models = manager.get_available_models()
    logger.info(f"可用模型: {available_models}")
    
    # 获取默认模型
    default_model = manager.get_default_model()
    logger.info(f"默认模型: {default_model}")
    
    # 测试模型切换
    manager.switch_model('efficientnet')
    logger.info(f"切换后默认模型: {manager.get_default_model()}")
    
    logger.info("模型管理器测试完成")
