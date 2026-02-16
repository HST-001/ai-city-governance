#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
YOLOv8模型适配器
实现对YOLOv8模型的兼容，将检测结果转换为系统评分
"""

import os
import logging
from PIL import Image
import numpy as np

from models.model_manager import StreetModel, RATING_DIMENSIONS, RATING_LEVELS, DIMENSION_WEIGHTS

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class YOLOv8Adapter(StreetModel):
    """YOLOv8模型适配器"""
    
    def __init__(self, model_path):
        """
        初始化YOLOv8适配器
        
        Args:
            model_path: 模型路径
        """
        self.model_path = model_path
        self.model = None
        self.class_names = {
            0: 'tree',          # 树木
            1: 'sidewalk',      # 人行道
            2: 'store sign',    # 店招
            3: 'Bicycle lane',  # 自行车道
            4: 'urban facility' # 城市设施
        }
        
        # 类别到维度的映射
        self.class_to_dimension = {
            'tree': 'greenery',
            'sidewalk': 'sidewalk',
            'store sign': 'store_sign',
            'Bicycle lane': 'bike_lane',
            'urban facility': 'urban_facilities'
        }
        
        # 加载模型
        self._load_model()
    
    def _load_model(self):
        """加载YOLOv8模型"""
        try:
            # 检查模型文件是否存在
            if not os.path.exists(self.model_path):
                logger.warning(f"YOLOv8模型文件不存在: {self.model_path}")
                logger.info("尝试加载预训练YOLOv8模型")
                # 加载预训练模型
                from ultralytics import YOLO
                self.model = YOLO('yolov8n.pt')  # 使用小模型作为备用
                logger.info("加载了预训练YOLOv8n模型")
            else:
                # 加载训练好的模型
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                logger.info(f"YOLOv8模型加载成功: {self.model_path}")
        except Exception as e:
            logger.error(f"YOLOv8模型加载失败: {e}")
            self.model = None
    
    def predict(self, image_path):
        """
        使用YOLOv8预测街道元素并生成评分
        
        Args:
            image_path: 图片路径
            
        Returns:
            dict: 评分结果，格式与现有系统兼容
        """
        try:
            if not self.model:
                logger.error("模型未加载，无法预测")
                return {}
            
            # 加载图片
            image = Image.open(image_path)
            
            # 使用YOLOv8预测
            results = self.model(image_path, conf=0.25)
            
            # 处理检测结果
            detection_results = self._process_detections(results[0])
            
            # 生成评分结果
            rating_results = self._generate_ratings(detection_results)
            
            # 计算综合评分
            overall_score = sum([rating_results[dim]['level'] * DIMENSION_WEIGHTS[dim] for dim in DIMENSION_WEIGHTS])
            overall_level = min(5, max(1, round(overall_score)))
            
            rating_results['overall'] = {
                'score': round(overall_score, 2),
                'level': overall_level,
                'description': RATING_LEVELS[overall_level - 1]['desc']
            }
            
            # 添加建议
            rating_results['recommendations'] = self._generate_recommendations(rating_results, detection_results)
            
            # 添加检测结果（用于前端可视化）
            rating_results['detections'] = detection_results
            
            return rating_results
        except Exception as e:
            logger.error(f"预测失败: {e}")
            return {}
    
    def _process_detections(self, result):
        """
        处理YOLOv8的检测结果
        
        Args:
            result: YOLOv8的检测结果
            
        Returns:
            list: 处理后的检测结果
        """
        detections = []
        
        # 解析检测结果
        boxes = result.boxes
        for box in boxes:
            # 获取边界框坐标
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # 获取置信度
            conf = box.conf[0].item()
            
            # 获取类别
            cls = int(box.cls[0].item())
            class_name = self.class_names.get(cls, f'class_{cls}')
            
            # 添加到检测结果
            detections.append({
                'class': class_name,
                'confidence': conf,
                'bbox': [x1, y1, x2, y2],
                'dimension': self.class_to_dimension.get(class_name, 'unknown')
            })
        
        return detections
    
    def _generate_ratings(self, detections):
        """
        根据检测结果生成评分
        
        Args:
            detections: 检测结果
            
        Returns:
            dict: 评分结果
        """
        # 初始化评分结果
        ratings = {}
        for dimension in DIMENSION_WEIGHTS:
            ratings[dimension] = {
                'level': 3,  # 默认3分
                'description': '一般',
                'confidence': 0.5
            }
        
        # 统计各维度的检测结果
        dimension_stats = {}
        for det in detections:
            dim = det['dimension']
            if dim not in dimension_stats:
                dimension_stats[dim] = {
                    'count': 0,
                    'total_conf': 0,
                    'avg_conf': 0
                }
            dimension_stats[dim]['count'] += 1
            dimension_stats[dim]['total_conf'] += det['confidence']
        
        # 计算各维度的平均置信度
        for dim, stats in dimension_stats.items():
            if stats['count'] > 0:
                stats['avg_conf'] = stats['total_conf'] / stats['count']
        
        # 根据检测结果生成评分
        # 店招/建筑
        if 'store_sign' in dimension_stats:
            store_sign_count = dimension_stats['store_sign']['count']
            store_sign_conf = dimension_stats['store_sign']['avg_conf']
            if store_sign_count >= 3 and store_sign_conf > 0.7:
                ratings['store_sign']['level'] = 5
                ratings['store_sign']['description'] = '优秀'
            elif store_sign_count >= 2 and store_sign_conf > 0.5:
                ratings['store_sign']['level'] = 4
                ratings['store_sign']['description'] = '良好'
            elif store_sign_count >= 1:
                ratings['store_sign']['level'] = 3
                ratings['store_sign']['description'] = '一般'
            else:
                ratings['store_sign']['level'] = 2
                ratings['store_sign']['description'] = '较差'
            ratings['store_sign']['confidence'] = store_sign_conf
        
        # 绿化
        if 'greenery' in dimension_stats:
            greenery_count = dimension_stats['greenery']['count']
            greenery_conf = dimension_stats['greenery']['avg_conf']
            if greenery_count >= 5 and greenery_conf > 0.7:
                ratings['greenery']['level'] = 5
                ratings['greenery']['description'] = '优秀'
            elif greenery_count >= 3 and greenery_conf > 0.5:
                ratings['greenery']['level'] = 4
                ratings['greenery']['description'] = '良好'
            elif greenery_count >= 1:
                ratings['greenery']['level'] = 3
                ratings['greenery']['description'] = '一般'
            else:
                ratings['greenery']['level'] = 2
                ratings['greenery']['description'] = '较差'
            ratings['greenery']['confidence'] = greenery_conf
        
        # 人行道
        if 'sidewalk' in dimension_stats:
            sidewalk_count = dimension_stats['sidewalk']['count']
            sidewalk_conf = dimension_stats['sidewalk']['avg_conf']
            if sidewalk_count >= 2 and sidewalk_conf > 0.7:
                ratings['sidewalk']['level'] = 5
                ratings['sidewalk']['description'] = '优秀'
            elif sidewalk_count >= 1 and sidewalk_conf > 0.5:
                ratings['sidewalk']['level'] = 4
                ratings['sidewalk']['description'] = '良好'
            else:
                ratings['sidewalk']['level'] = 3
                ratings['sidewalk']['description'] = '一般'
            ratings['sidewalk']['confidence'] = sidewalk_conf
        
        # 自行车道
        if 'bike_lane' in dimension_stats:
            bike_lane_count = dimension_stats['bike_lane']['count']
            bike_lane_conf = dimension_stats['bike_lane']['avg_conf']
            if bike_lane_count >= 2 and bike_lane_conf > 0.7:
                ratings['bike_lane']['level'] = 5
                ratings['bike_lane']['description'] = '优秀'
            elif bike_lane_count >= 1 and bike_lane_conf > 0.5:
                ratings['bike_lane']['level'] = 4
                ratings['bike_lane']['description'] = '良好'
            else:
                ratings['bike_lane']['level'] = 2
                ratings['bike_lane']['description'] = '较差'
            ratings['bike_lane']['confidence'] = bike_lane_conf
        
        # 城市设施
        if 'urban_facilities' in dimension_stats:
            urban_facilities_count = dimension_stats['urban_facilities']['count']
            urban_facilities_conf = dimension_stats['urban_facilities']['avg_conf']
            if urban_facilities_count >= 3 and urban_facilities_conf > 0.7:
                ratings['urban_facilities']['level'] = 5
                ratings['urban_facilities']['description'] = '优秀'
            elif urban_facilities_count >= 2 and urban_facilities_conf > 0.5:
                ratings['urban_facilities']['level'] = 4
                ratings['urban_facilities']['description'] = '良好'
            elif urban_facilities_count >= 1:
                ratings['urban_facilities']['level'] = 3
                ratings['urban_facilities']['description'] = '一般'
            else:
                ratings['urban_facilities']['level'] = 2
                ratings['urban_facilities']['description'] = '较差'
            ratings['urban_facilities']['confidence'] = urban_facilities_conf
        
        return ratings
    
    def _generate_recommendations(self, ratings, detections):
        """
        根据评分结果生成建议
        
        Args:
            ratings: 评分结果
            detections: 检测结果
            
        Returns:
            list: 建议列表
        """
        recommendations = []
        
        if ratings.get('store_sign', {}).get('level', 5) <= 2:
            recommendations.append('未检测到店招或店招质量较差，建议检查店招设置情况。')
        
        if ratings.get('greenery', {}).get('level', 5) <= 2:
            recommendations.append('绿化覆盖率低，建议增加绿植面积和种类。')
        
        if ratings.get('sidewalk', {}).get('level', 5) <= 2:
            recommendations.append('未检测到人行道或人行道质量较差，建议检查人行道建设情况。')
        
        if ratings.get('bike_lane', {}).get('level', 5) <= 2:
            recommendations.append('未检测到自行车道，建议规划建设自行车道网络。')
        
        if ratings.get('urban_facilities', {}).get('level', 5) <= 2:
            recommendations.append('城市设施数量不足，建议增加公共设施设置。')
        
        # 根据检测结果添加具体建议
        tree_count = sum(1 for det in detections if det['class'] == 'tree')
        if tree_count == 0:
            recommendations.append('未检测到行道树，建议种植行道树以改善街道环境。')
        
        bike_lane_count = sum(1 for det in detections if det['class'] == 'Bicycle lane')
        if bike_lane_count == 0:
            recommendations.append('未检测到自行车道，建议增设自行车道以提升绿色出行体验。')
        
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
            'model_name': 'YOLOv8',
            'model_path': self.model_path,
            'input_size': (640, 640),
            'classes': list(self.class_names.values()),
            'description': '基于YOLOv8的街道元素检测和评分模型',
            'capabilities': ['object detection', 'multi-dimensional rating', 'visualization']
        }
    
    def get_model_type(self):
        """
        获取模型类型
        
        Returns:
            str: 模型类型
        """
        return 'detection'


if __name__ == '__main__':
    # 测试YOLOv8适配器
    adapter = YOLOv8Adapter('models/yolov8/best.pt')
    
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
