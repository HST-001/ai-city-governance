#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
数据处理脚本，用于准备训练数据
"""

import os
import json
import pandas as pd
import numpy as np
import cv2
from PIL import Image
from sklearn.model_selection import train_test_split
from typing import Dict, List, Tuple, Optional
import albumentations as A
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 定义数据目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO_DIR = os.path.join(BASE_DIR, 'photo')
DATA_DIR = os.path.join(BASE_DIR, 'ai-models', 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
ANNOTATIONS_DIR = os.path.join(DATA_DIR, 'annotations')

# 确保目录存在
for dir_path in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, ANNOTATIONS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# 定义评分维度和等级
RATING_DIMENSIONS = {
    'store_sign': '店招',  # 店招
    'street_trees': '行道树',  # 行道树
    'greening': '绿化',  # 绿化
    'sidewalk_paving': '人行道铺装',  # 人行道铺装
    'bike_lane_connectivity': '自行车道贯通性'  # 自行车道贯通性
}

# 定义等级（1-5级，5级最好）
RATING_LEVELS = {
    1: '差',
    2: '较差', 
    3: '一般',
    4: '良好',
    5: '优秀'
}

class DataProcessor:
    """
    数据处理类，用于准备训练和验证数据
    """
    def __init__(self, image_size: Tuple[int, int] = (224, 224)):
        self.image_size = image_size
        self.transform = self._get_transforms()
    
    def _get_transforms(self) -> A.Compose:
        """
        获取数据增强和预处理转换
        """
        return A.Compose([
            A.Resize(width=self.image_size[0], height=self.image_size[1]),
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.Rotate(limit=10, p=0.3),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            A.pytorch.transforms.ToTensorV2()
        ])
    
    def create_initial_annotations(self) -> None:
        """
        创建初始标注文件（从示例照片开始）
        """
        # 检查是否已有标注文件
        annotations_path = os.path.join(ANNOTATIONS_DIR, 'annotations.json')
        if os.path.exists(annotations_path):
            logger.info(f"标注文件已存在: {annotations_path}")
            return
        
        # 获取照片目录中的所有图片
        photo_files = [f for f in os.listdir(PHOTO_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # 创建初始标注字典
        annotations = {}
        for photo_file in photo_files:
            # 复制照片到原始数据目录
            src_path = os.path.join(PHOTO_DIR, photo_file)
            dst_path = os.path.join(RAW_DATA_DIR, photo_file)
            if not os.path.exists(dst_path):
                try:
                    img = Image.open(src_path)
                    img.save(dst_path)
                    logger.info(f"已复制照片: {photo_file}")
                except Exception as e:
                    logger.error(f"复制照片失败 {photo_file}: {e}")
                    continue
            
            # 为每张照片创建默认标注（需要后续手动完善）
            annotations[photo_file] = {
                'dimensions': {
                    'store_sign': 3,  # 默认一般
                    'street_trees': 3,
                    'greening': 3,
                    'sidewalk_paving': 3,
                    'bike_lane_connectivity': 3
                },
                'overall_level': 3,
                'notes': '默认标注，需要手动评估后修改'
            }
        
        # 保存标注文件
        with open(annotations_path, 'w', encoding='utf-8') as f:
            json.dump(annotations, f, ensure_ascii=False, indent=2)
        
        logger.info(f"已创建初始标注文件，包含 {len(annotations)} 张照片")
        logger.info(f"请手动编辑标注文件: {annotations_path}")
    
    def prepare_training_data(self, test_size: float = 0.2) -> None:
        """
        准备训练和测试数据
        """
        annotations_path = os.path.join(ANNOTATIONS_DIR, 'annotations.json')
        if not os.path.exists(annotations_path):
            logger.error(f"标注文件不存在: {annotations_path}")
            logger.info("请先运行 create_initial_annotations() 创建标注文件")
            return
        
        # 加载标注
        with open(annotations_path, 'r', encoding='utf-8') as f:
            annotations = json.load(f)
        
        # 准备数据列表
        image_paths = []
        labels = []
        
        for photo_file, annotation in annotations.items():
            image_path = os.path.join(RAW_DATA_DIR, photo_file)
            if os.path.exists(image_path):
                image_paths.append(image_path)
                # 获取所有维度的评分作为标签
                label_vector = []
                for dimension in RATING_DIMENSIONS.keys():
                    # 将1-5级映射到0-4索引（用于分类）
                    level = annotation['dimensions'].get(dimension, 3) - 1
                    label_vector.append(level)
                labels.append(label_vector)
        
        if not image_paths:
            logger.error("没有找到有效的图片数据")
            return
        
        # 划分训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            image_paths, labels, test_size=test_size, random_state=42
        )
        
        # 创建数据集字典
        dataset = {
            'train': {
                'image_paths': X_train,
                'labels': y_train
            },
            'test': {
                'image_paths': X_test,
                'labels': y_test
            }
        }
        
        # 保存数据集划分
        dataset_path = os.path.join(PROCESSED_DATA_DIR, 'dataset.json')
        with open(dataset_path, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        
        logger.info(f"已准备训练数据")
        logger.info(f"训练集大小: {len(X_train)}")
        logger.info(f"测试集大小: {len(X_test)}")
        logger.info(f"数据集信息已保存至: {dataset_path}")
    
    def preprocess_images(self) -> None:
        """
        预处理所有图像并保存
        """
        dataset_path = os.path.join(PROCESSED_DATA_DIR, 'dataset.json')
        if not os.path.exists(dataset_path):
            logger.error(f"数据集文件不存在: {dataset_path}")
            logger.info("请先运行 prepare_training_data() 准备数据集")
            return
        
        # 加载数据集
        with open(dataset_path, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
        
        # 预处理训练集和测试集图像
        for split in ['train', 'test']:
            split_dir = os.path.join(PROCESSED_DATA_DIR, split)
            os.makedirs(split_dir, exist_ok=True)
            
            image_paths = dataset[split]['image_paths']
            for i, img_path in enumerate(image_paths):
                try:
                    # 加载图像
                    img = cv2.imread(img_path)
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    
                    # 应用转换
                    transformed = self.transform(image=img)
                    transformed_img = transformed['image']
                    
                    # 保存预处理后的图像信息（实际训练时会动态加载和转换）
                    img_name = os.path.basename(img_path)
                    img_info = {
                        'original_path': img_path,
                        'processed_path': os.path.join(split_dir, img_name)
                    }
                    
                    info_path = os.path.join(split_dir, f'{os.path.splitext(img_name)[0]}_info.json')
                    with open(info_path, 'w', encoding='utf-8') as f:
                        json.dump(img_info, f, ensure_ascii=False, indent=2)
                    
                    if (i + 1) % 10 == 0:
                        logger.info(f"已预处理 {split} 集 {i + 1}/{len(image_paths)} 张图像")
                        
                except Exception as e:
                    logger.error(f"预处理图像失败 {img_path}: {e}")
        
        logger.info("图像预处理完成")

def generate_example_annotations():
    """
    生成示例标注文件，为现有照片添加模拟的评分数据
    """
    # 检查照片目录
    if not os.path.exists(PHOTO_DIR):
        logger.error(f"照片目录不存在: {PHOTO_DIR}")
        return
    
    # 获取所有照片
    photo_files = [f for f in os.listdir(PHOTO_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not photo_files:
        logger.error("照片目录中没有找到图片文件")
        return
    
    # 创建标注字典
    annotations = {}
    for photo_file in photo_files:
        # 根据文件名进行简单的分类
        # 这里使用模拟数据，实际应用中需要人工标注或使用预训练模型自动标注
        if '梨园路铺装' in photo_file:
            # 人行道铺装相关照片
            annotations[photo_file] = {
                'dimensions': {
                    'store_sign': 3,  # 默认一般
                    'street_trees': 3,
                    'greening': 3,
                    'sidewalk_paving': 2,  # 铺装较差
                    'bike_lane_connectivity': 3
                },
                'overall_level': 3,
                'notes': '示例标注：人行道铺装较差，其他一般'
            }
        else:
            # 普通街道照片
            annotations[photo_file] = {
                'dimensions': {
                    'store_sign': 3,  # 默认一般
                    'street_trees': 4,  # 行道树良好
                    'greening': 4,  # 绿化良好
                    'sidewalk_paving': 3,
                    'bike_lane_connectivity': 2  # 自行车道贯通性较差
                },
                'overall_level': 3,
                'notes': '示例标注：行道树和绿化良好，自行车道贯通性较差'
            }
    
    # 保存标注文件
    annotations_path = os.path.join(ANNOTATIONS_DIR, 'annotations.json')
    with open(annotations_path, 'w', encoding='utf-8') as f:
        json.dump(annotations, f, ensure_ascii=False, indent=2)
    
    logger.info(f"已生成示例标注文件: {annotations_path}")
    logger.info(f"包含 {len(annotations)} 张照片的示例评分数据")

def main():
    """
    主函数
    """
    logger.info("开始数据处理")
    
    # 初始化数据处理器
    processor = DataProcessor(image_size=(224, 224))
    
    # 生成示例标注（使用模拟数据）
    generate_example_annotations()
    
    # 准备训练数据
    processor.prepare_training_data(test_size=0.2)
    
    # 预处理图像
    processor.preprocess_images()
    
    logger.info("数据处理完成")

if __name__ == "__main__":
    main()
