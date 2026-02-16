#!/usr/bin/env python3
"""
创建包含评分信息的完整训练数据集
"""

import os
import json
import shutil
from pathlib import Path

# 输入路径
JSON_DIR = 'data/下载'
YOLO_EXPORTS_DIR = 'label_studio_exports'
OUTPUT_DIR = 'data/yolo_dataset_complete_with_scores'

# 评分维度映射
SCORE_DIMENSIONS = {
    'project-1': {
        'name': '绿化',
        'dimensions': {
            'green_maintenance': '管养水平',
            'green_coverage': '覆盖度',
            'green_aesthetic': '观赏性',
            'green_shade': '遮阴性',
            'green_ecology': '生态性',
            'green_existence': '有无'
        },
        'class_id': 0
    },
    'project-2': {
        'name': '店招/建筑',
        'dimensions': {
            'store_color': '色彩',
            'store_style': '样式',
            'store_cleanliness': '整洁度',
            'store_safety': '安全性',
            'store_compliance': '合规性',
            'store_night_effect': '夜间效果',
            'store_existence': '有无'
        },
        'class_id': 2
    },
    'project-3': {
        'name': '人行道',
        'dimensions': {
            'sidewalk_damage': '铺装破损度',
            'sidewalk_cleanliness': '整洁度',
            'sidewalk_accessibility': '无障碍友好性',
            'sidewalk_continuity': '连续性',
            'sidewalk_width': '宽度合理性',
            'sidewalk_drainage': '排水系统',
            'sidewalk_lighting': '夜间照明',
            'sidewalk_existence': '有无'
        },
        'class_id': 1
    },
    'project-4': {
        'name': '自行车道',
        'dimensions': {
            'bike_existence': '有无',
            'bike_shared_lane': '人车共板与否',
            'bike_continuity': '连续性',
            'bike_damage': '破损情况',
            'bike_parking': '自行车停放情况'
        },
        'class_id': 3
    },
    'project-5': {
        'name': '城市设施',
        'dimensions': {
            'facility_existence': '有无',
            'facility_location': '位置合理与否',
            'facility_maintenance': '维护状况',
            'facility_style': '色彩样式',
            'facility_functionality': '功能性'
        },
        'class_id': 4
    }
}

def calculate_score(scores):
    """
    计算平均评分
    """
    numeric_scores = []
    for key, value in scores.items():
        if value.isdigit():
            numeric_scores.append(int(value))
        elif value in ['有', '是', '好', '优秀']:
            numeric_scores.append(10)
        elif value in ['无', '否', '差', '极差']:
            numeric_scores.append(0)
        elif value in ['中等', '一般']:
            numeric_scores.append(5)
    
    if numeric_scores:
        return sum(numeric_scores) / len(numeric_scores)
    return 0

def process_json_file(json_path, project_key):
    """
    处理JSON文件，提取评分信息
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    scores_data = {}
    
    for item in data:
        image_id = item.get('id')
        data_info = item.get('data', {})
        image_url = data_info.get('image')
        
        if not image_url:
            continue
        
        image_filename = image_url.split('/')[-1]
        
        # 提取评分信息
        annotations = item.get('annotations', [])
        scores = {}
        
        for annotation in annotations:
            result = annotation.get('result', [])
            for r in result:
                if r.get('type') == 'choices':
                    from_name = r.get('from_name')
                    choices = r.get('value', {}).get('choices', [])
                    if choices:
                        scores[from_name] = choices[0]
        
        # 计算平均评分
        avg_score = calculate_score(scores)
        
        scores_data[image_filename] = {
            'image_id': image_id,
            'scores': scores,
            'avg_score': avg_score
        }
    
    return scores_data

def merge_data():
    """
    合并JSON评分数据和YOLO标注数据
    """
    print("合并评分数据和YOLO标注数据...")
    print("=" * 70)
    
    # 创建输出目录
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'labels'), exist_ok=True)
    
    # 处理所有项目
    all_scores = {}
    
    for project_key in SCORE_DIMENSIONS.keys():
        # 查找JSON文件
        json_files = [f for f in os.listdir(JSON_DIR) if f.startswith(project_key) and f.endswith('.json')]
        
        if not json_files:
            continue
        
        json_path = os.path.join(JSON_DIR, json_files[0])
        project_info = SCORE_DIMENSIONS[project_key]
        
        print(f"处理: {project_info['name']} ({json_files[0]})")
        
        # 解析JSON文件获取评分
        scores_data = process_json_file(json_path, project_key)
        print(f"  - 提取了 {len(scores_data)} 条评分记录")
        
        # 合并到总评分数据
        all_scores.update(scores_data)
    
    # 复制YOLO标注数据并添加评分信息
    yolo_dataset_path = 'data/yolo_dataset_complete'
    
    for split in ['train', 'val', 'test']:
        images_dir = os.path.join(yolo_dataset_path, split, 'images')
        labels_dir = os.path.join(yolo_dataset_path, split, 'labels')
        
        if not os.path.exists(images_dir):
            continue
        
        image_files = [f for f in os.listdir(images_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
        
        print(f"\n处理 {split} 集: {len(image_files)} 张图片")
        
        for image_file in image_files:
            # 复制图片
            src_image = os.path.join(images_dir, image_file)
            dst_image = os.path.join(OUTPUT_DIR, split, 'images', image_file)
            shutil.copy2(src_image, dst_image)
            
            # 复制标签
            label_file = os.path.splitext(image_file)[0] + '.txt'
            src_label = os.path.join(labels_dir, label_file)
            dst_label = os.path.join(OUTPUT_DIR, split, 'labels', label_file)
            
            if os.path.exists(src_label):
                shutil.copy2(src_label, dst_label)
            
            # 如果有评分信息，添加到标签文件
            if image_file in all_scores:
                score_info = all_scores[image_file]
                with open(dst_label, 'a', encoding='utf-8') as f:
                    f.write(f"\n# score: {score_info['avg_score']:.2f}")
                    for key, value in score_info['scores'].items():
                        f.write(f"\n# {key}: {value}")
    
    # 保存评分数据
    scores_file = os.path.join(OUTPUT_DIR, 'scores.json')
    with open(scores_file, 'w', encoding='utf-8') as f:
        json.dump(all_scores, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 70)
    print(f"✅ 数据集创建完成！")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"评分数据: {scores_file}")
    print()
    
    # 统计信息
    total_images = 0
    scored_images = 0
    for split in ['train', 'val', 'test']:
        images_dir = os.path.join(OUTPUT_DIR, split, 'images')
        if os.path.exists(images_dir):
            images = len([f for f in os.listdir(images_dir) if f.endswith(('.jpg', '.jpeg', '.png'))])
            total_images += images
    
    print(f"总图片数量: {total_images}")
    print(f"有评分的图片: {len(all_scores)}")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    merge_data()
