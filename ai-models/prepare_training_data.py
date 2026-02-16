#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
准备训练数据 - 使用已有的训练数据集
"""

import os
import json
import shutil
import random
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 定义路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_UPLOADS = os.path.join(BASE_DIR, 'backend', 'uploads', 'training-datasets')
AI_MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(AI_MODELS_DIR, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
ANNOTATIONS_DIR = os.path.join(DATA_DIR, 'annotations')

# 确保目录存在
for dir_path in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, ANNOTATIONS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# 定义评分维度
RATING_DIMENSIONS = {
    'store_sign': '店招',
    'street_trees': '行道树',
    'greening': '绿化',
    'sidewalk_paving': '人行道铺装',
    'bike_lane_connectivity': '自行车道贯通性'
}

def collect_training_images():
    """
    收集所有训练数据集的图片
    """
    logger.info("收集训练数据集图片...")
    
    image_files = []
    
    if not os.path.exists(BACKEND_UPLOADS):
        logger.warning(f"训练数据集目录不存在: {BACKEND_UPLOADS}")
        return image_files
    
    # 遍历所有数据集目录
    for dataset_name in os.listdir(BACKEND_UPLOADS):
        dataset_path = os.path.join(BACKEND_UPLOADS, dataset_name)
        if os.path.isdir(dataset_path):
            logger.info(f"处理数据集: {dataset_name}")
            
            # 收集该数据集中的所有图片
            for file_name in os.listdir(dataset_path):
                if file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    src_path = os.path.join(dataset_path, file_name)
                    image_files.append({
                        'src_path': src_path,
                        'dataset': dataset_name,
                        'filename': file_name
                    })
    
    logger.info(f"共找到 {len(image_files)} 张图片")
    return image_files

def copy_images_to_raw_data(image_files):
    """
    将图片复制到原始数据目录
    """
    logger.info("复制图片到原始数据目录...")
    
    copied_files = []
    
    for img_info in image_files:
        try:
            # 生成新的文件名（避免重名）
            base_name = os.path.splitext(img_info['filename'])[0]
            ext = os.path.splitext(img_info['filename'])[1]
            new_filename = f"{img_info['dataset']}_{base_name}{ext}"
            dst_path = os.path.join(RAW_DATA_DIR, new_filename)
            
            # 复制文件
            shutil.copy2(img_info['src_path'], dst_path)
            copied_files.append({
                'filename': new_filename,
                'dataset': img_info['dataset'],
                'original_filename': img_info['filename']
            })
            
        except Exception as e:
            logger.error(f"复制文件失败 {img_info['filename']}: {e}")
    
    logger.info(f"成功复制 {len(copied_files)} 张图片")
    return copied_files

def generate_annotations(copied_files):
    """
    生成标注文件
    """
    logger.info("生成标注文件...")
    
    annotations = {}
    
    for file_info in copied_files:
        # 为每张图片生成随机评分（模拟标注）
        # 实际应用中需要人工标注或使用预训练模型
        
        # 根据数据集名称调整评分倾向
        dataset_name = file_info['dataset'].lower()
        
        if '绿化' in dataset_name:
            # 绿化相关数据集
            annotations[file_info['filename']] = {
                'dimensions': {
                    'store_sign': random.randint(2, 4),
                    'street_trees': random.randint(3, 5),
                    'greening': random.randint(4, 5),
                    'sidewalk_paving': random.randint(2, 4),
                    'bike_lane_connectivity': random.randint(2, 4)
                },
                'overall_level': random.randint(3, 4),
                'notes': '绿化相关数据集，绿化评分较高'
            }
        elif '铺装' in dataset_name:
            # 铺装相关数据集
            annotations[file_info['filename']] = {
                'dimensions': {
                    'store_sign': random.randint(2, 4),
                    'street_trees': random.randint(2, 4),
                    'greening': random.randint(2, 4),
                    'sidewalk_paving': random.randint(1, 3),
                    'bike_lane_connectivity': random.randint(2, 4)
                },
                'overall_level': random.randint(2, 3),
                'notes': '铺装相关数据集，人行道铺装评分较低'
            }
        else:
            # 通用数据集
            annotations[file_info['filename']] = {
                'dimensions': {
                    'store_sign': random.randint(2, 4),
                    'street_trees': random.randint(2, 4),
                    'greening': random.randint(2, 4),
                    'sidewalk_paving': random.randint(2, 4),
                    'bike_lane_connectivity': random.randint(2, 4)
                },
                'overall_level': random.randint(2, 4),
                'notes': '通用数据集，各维度评分均衡'
            }
    
    # 保存标注文件
    annotations_path = os.path.join(ANNOTATIONS_DIR, 'annotations.json')
    with open(annotations_path, 'w', encoding='utf-8') as f:
        json.dump(annotations, f, ensure_ascii=False, indent=2)
    
    logger.info(f"标注文件已保存: {annotations_path}")
    logger.info(f"包含 {len(annotations)} 张图片的标注数据")
    
    return annotations

def prepare_dataset(annotations):
    """
    准备训练数据集（划分训练集和测试集）
    """
    logger.info("准备训练数据集...")
    
    # 获取所有图片文件名
    image_files = list(annotations.keys())
    
    # 随机划分训练集和测试集（80%训练，20%测试）
    random.seed(42)
    random.shuffle(image_files)
    
    split_idx = int(len(image_files) * 0.8)
    train_files = image_files[:split_idx]
    test_files = image_files[split_idx:]
    
    # 准备数据集
    dataset = {
        'train': {
            'image_paths': [os.path.join(RAW_DATA_DIR, f) for f in train_files],
            'labels': [
                [
                    annotations[f]['dimensions'][dim] - 1  # 转换为0-4索引
                    for dim in RATING_DIMENSIONS.keys()
                ]
                for f in train_files
            ]
        },
        'test': {
            'image_paths': [os.path.join(RAW_DATA_DIR, f) for f in test_files],
            'labels': [
                [
                    annotations[f]['dimensions'][dim] - 1  # 转换为0-4索引
                    for dim in RATING_DIMENSIONS.keys()
                ]
                for f in test_files
            ]
        }
    }
    
    # 保存数据集
    dataset_path = os.path.join(PROCESSED_DATA_DIR, 'dataset.json')
    with open(dataset_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    logger.info(f"训练集: {len(train_files)} 张图片")
    logger.info(f"测试集: {len(test_files)} 张图片")
    logger.info(f"数据集已保存: {dataset_path}")
    
    return dataset

def main():
    """
    主函数
    """
    logger.info("=" * 60)
    logger.info("开始准备训练数据")
    logger.info("=" * 60)
    
    # 1. 收集训练图片
    image_files = collect_training_images()
    
    if not image_files:
        logger.error("没有找到训练图片，请先上传训练数据集")
        return
    
    # 2. 复制图片到原始数据目录
    copied_files = copy_images_to_raw_data(image_files)
    
    # 3. 生成标注文件
    annotations = generate_annotations(copied_files)
    
    # 4. 准备训练数据集
    dataset = prepare_dataset(annotations)
    
    logger.info("=" * 60)
    logger.info("训练数据准备完成！")
    logger.info("=" * 60)
    logger.info(f"数据目录: {DATA_DIR}")
    logger.info(f"标注文件: {os.path.join(ANNOTATIONS_DIR, 'annotations.json')}")
    logger.info(f"数据集文件: {os.path.join(PROCESSED_DATA_DIR, 'dataset.json')}")
    logger.info("")
    logger.info("下一步：运行训练脚本开始训练模型")
    logger.info("命令: python scripts/train_model.py")

if __name__ == "__main__":
    main()
