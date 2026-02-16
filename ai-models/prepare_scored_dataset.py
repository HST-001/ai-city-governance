#!/usr/bin/env python3
"""
准备包含评分信息的训练数据
"""

import os
import json
import random
from PIL import Image

# 数据集路径
YOLO_DATASET_PATH = 'data/yolo_dataset_complete'
TRAIN_IMAGES_PATH = os.path.join(YOLO_DATASET_PATH, 'train', 'images')
VAL_IMAGES_PATH = os.path.join(YOLO_DATASET_PATH, 'val', 'images')
TEST_IMAGES_PATH = os.path.join(YOLO_DATASET_PATH, 'test', 'images')

# 输出路径
SCORED_DATASET_PATH = 'data/yolo_dataset_scored'
SCORED_TRAIN_PATH = os.path.join(SCORED_DATASET_PATH, 'train')
SCORED_VAL_PATH = os.path.join(SCORED_DATASET_PATH, 'val')
SCORED_TEST_PATH = os.path.join(SCORED_DATASET_PATH, 'test')

# 评分配置
MIN_SCORE = 0
MAX_SCORE = 100

# 基于物体数量的评分规则
def calculate_score_from_labels(label_path):
    """
    基于标签文件计算评分
    """
    if not os.path.exists(label_path):
        return random.randint(30, 60)  # 没有标签的图片给中等偏低的分
    
    with open(label_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 统计各类物体数量
    object_counts = {
        'tree': 0,           # 0
        'sidewalk': 0,       # 1
        'store sign': 0,     # 2
        'Bicycle lane': 0,   # 3
        'urban facility': 0  # 4
    }
    
    for line in lines:
        parts = line.strip().split()
        if len(parts) >= 5:
            class_id = int(parts[0])
            if class_id == 0:
                object_counts['tree'] += 1
            elif class_id == 1:
                object_counts['sidewalk'] += 1
            elif class_id == 2:
                object_counts['store sign'] += 1
            elif class_id == 3:
                object_counts['Bicycle lane'] += 1
            elif class_id == 4:
                object_counts['urban facility'] += 1
    
    # 计算评分
    # 绿化和人行道是必须的，权重更高
    score = 0
    
    # 绿化评分 (30分)
    if object_counts['tree'] == 0:
        tree_score = 0
    else:
        tree_score = min(object_counts['tree'] * 5, 30)
    
    # 人行道评分 (30分)
    if object_counts['sidewalk'] == 0:
        sidewalk_score = 0
    else:
        sidewalk_score = min(object_counts['sidewalk'] * 10, 30)
    
    # 店招评分 (15分)
    store_score = min(object_counts['store sign'] * 2, 15)
    
    # 自行车道评分 (15分)
    bicycle_score = min(object_counts['Bicycle lane'] * 5, 15)
    
    # 城市设施评分 (10分)
    facility_score = min(object_counts['urban facility'] * 2, 10)
    
    # 总分
    score = tree_score + sidewalk_score + store_score + bicycle_score + facility_score
    
    # 添加一些随机波动，使评分更自然
    score = max(MIN_SCORE, min(MAX_SCORE, score + random.randint(-5, 5)))
    
    return score

def prepare_scored_dataset():
    """
    准备包含评分信息的数据集
    """
    print("准备包含评分信息的数据集...")
    
    # 创建输出目录
    for path in [SCORED_DATASET_PATH, SCORED_TRAIN_PATH, SCORED_VAL_PATH, SCORED_TEST_PATH]:
        os.makedirs(path, exist_ok=True)
        os.makedirs(os.path.join(path, 'images'), exist_ok=True)
        os.makedirs(os.path.join(path, 'labels'), exist_ok=True)
    
    # 处理训练集
    print("处理训练集...")
    train_scores = {}
    if os.path.exists(TRAIN_IMAGES_PATH):
        for image_file in os.listdir(TRAIN_IMAGES_PATH):
            if image_file.endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(TRAIN_IMAGES_PATH, image_file)
                label_file = os.path.splitext(image_file)[0] + '.txt'
                label_path = os.path.join(YOLO_DATASET_PATH, 'train', 'labels', label_file)
                
                # 计算评分
                score = calculate_score_from_labels(label_path)
                train_scores[image_file] = score
                
                # 复制图片和标签
                dest_image_path = os.path.join(SCORED_TRAIN_PATH, 'images', image_file)
                dest_label_path = os.path.join(SCORED_TRAIN_PATH, 'labels', label_file)
                
                if os.path.exists(image_path):
                    os.system(f'copy "{image_path}" "{dest_image_path}"')
                if os.path.exists(label_path):
                    os.system(f'copy "{label_path}" "{dest_label_path}"')
    
    # 处理验证集
    print("处理验证集...")
    val_scores = {}
    if os.path.exists(VAL_IMAGES_PATH):
        for image_file in os.listdir(VAL_IMAGES_PATH):
            if image_file.endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(VAL_IMAGES_PATH, image_file)
                label_file = os.path.splitext(image_file)[0] + '.txt'
                label_path = os.path.join(YOLO_DATASET_PATH, 'val', 'labels', label_file)
                
                # 计算评分
                score = calculate_score_from_labels(label_path)
                val_scores[image_file] = score
                
                # 复制图片和标签
                dest_image_path = os.path.join(SCORED_VAL_PATH, 'images', image_file)
                dest_label_path = os.path.join(SCORED_VAL_PATH, 'labels', label_file)
                
                if os.path.exists(image_path):
                    os.system(f'copy "{image_path}" "{dest_image_path}"')
                if os.path.exists(label_path):
                    os.system(f'copy "{label_path}" "{dest_label_path}"')
    
    # 处理测试集
    print("处理测试集...")
    test_scores = {}
    if os.path.exists(TEST_IMAGES_PATH):
        for image_file in os.listdir(TEST_IMAGES_PATH):
            if image_file.endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(TEST_IMAGES_PATH, image_file)
                label_file = os.path.splitext(image_file)[0] + '.txt'
                label_path = os.path.join(YOLO_DATASET_PATH, 'test', 'labels', label_file)
                
                # 计算评分
                score = calculate_score_from_labels(label_path)
                test_scores[image_file] = score
                
                # 复制图片和标签
                dest_image_path = os.path.join(SCORED_TEST_PATH, 'images', image_file)
                dest_label_path = os.path.join(SCORED_TEST_PATH, 'labels', label_file)
                
                if os.path.exists(image_path):
                    os.system(f'copy "{image_path}" "{dest_image_path}"')
                if os.path.exists(label_path):
                    os.system(f'copy "{label_path}" "{dest_label_path}"')
    
    # 保存评分信息
    scores_data = {
        'train': train_scores,
        'val': val_scores,
        'test': test_scores
    }
    
    scores_file = os.path.join(SCORED_DATASET_PATH, 'scores.json')
    with open(scores_file, 'w', encoding='utf-8') as f:
        json.dump(scores_data, f, ensure_ascii=False, indent=2)
    
    # 创建新的dataset.yaml文件
    create_dataset_yaml()
    
    print(f"✅ 评分数据集准备完成！")
    print(f"训练集图片数量: {len(train_scores)}")
    print(f"验证集图片数量: {len(val_scores)}")
    print(f"测试集图片数量: {len(test_scores)}")
    print(f"评分信息保存至: {scores_file}")

def create_dataset_yaml():
    """
    创建新的dataset.yaml文件
    """
    dataset_yaml_content = f"""
path: {os.path.abspath(SCORED_DATASET_PATH)}
train: train/images
val: val/images
test: test/images

nc: 5
names: {{
    0: "tree",
    1: "sidewalk",
    2: "store sign",
    3: "Bicycle lane",
    4: "urban facility"
}}

# 评分信息
has_scores: true
scores_file: scores.json
"""
    
    dataset_yaml_path = os.path.join(SCORED_DATASET_PATH, 'dataset.yaml')
    with open(dataset_yaml_path, 'w', encoding='utf-8') as f:
        f.write(dataset_yaml_content)
    
    print(f"✅ dataset.yaml 创建完成: {dataset_yaml_path}")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    prepare_scored_dataset()
