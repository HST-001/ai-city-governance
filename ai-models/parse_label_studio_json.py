#!/usr/bin/env python3
"""
解析Label Studio JSON导出数据，提取评分信息和边界框标注
"""

import os
import json
import cv2
import numpy as np
from pathlib import Path

# 输入路径
JSON_DIR = 'data/下载'
OUTPUT_DIR = 'data/yolo_dataset_with_scores'

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

def polygon_to_bbox(polygon_points, img_width, img_height):
    """
    将多边形转换为边界框（YOLO格式）
    """
    polygon_points = np.array(polygon_points)
    
    # 计算边界框
    x_min = np.min(polygon_points[:, 0])
    y_min = np.min(polygon_points[:, 1])
    x_max = np.max(polygon_points[:, 0])
    y_max = np.max(polygon_points[:, 1])
    
    # 转换为YOLO格式（中心点坐标 + 宽高，归一化到0-1）
    x_center = (x_min + x_max) / 2.0 / img_width
    y_center = (y_min + y_max) / 2.0 / img_height
    width = (x_max - x_min) / img_width
    height = (y_max - y_min) / img_height
    
    return x_center, y_center, width, height

def parse_json_file(json_path, project_info):
    """
    解析JSON文件，提取评分信息和标注
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = []
    
    for item in data:
        # 获取图片信息
        image_id = item.get('id')
        data_info = item.get('data', {})
        image_url = data_info.get('image')
        
        # 提取图片文件名
        if image_url:
            image_filename = image_url.split('/')[-1]
        else:
            continue
        
        # 获取图片尺寸
        annotations = item.get('annotations', [])
        img_width = None
        img_height = None
        
        # 提取评分信息
        scores = {}
        bboxes = []
        
        for annotation in annotations:
            result = annotation.get('result', [])
            
            for r in result:
                # 提取图片尺寸
                if 'original_width' in r.get('value', {}):
                    img_width = r['value']['original_width']
                    img_height = r['value']['original_height']
                
                # 提取多边形标注（边界框）
                if r.get('type') == 'polygonlabels':
                    points = r['value'].get('points', [])
                    if points and img_width and img_height:
                        x_center, y_center, width, height = polygon_to_bbox(points, img_width, img_height)
                        bboxes.append({
                            'class_id': project_info['class_id'],
                            'x_center': x_center,
                            'y_center': y_center,
                            'width': width,
                            'height': height
                        })
                
                # 提取评分信息
                if r.get('type') == 'choices':
                    from_name = r.get('from_name')
                    choices = r.get('value', {}).get('choices', [])
                    if choices:
                        scores[from_name] = choices[0]
        
        # 计算平均评分
        if scores:
            # 将评分转换为数值
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
            
            avg_score = sum(numeric_scores) / len(numeric_scores) if numeric_scores else 0
        else:
            avg_score = 0
        
        results.append({
            'image_id': image_id,
            'image_filename': image_filename,
            'scores': scores,
            'avg_score': avg_score,
            'bboxes': bboxes,
            'img_width': img_width,
            'img_height': img_height
        })
    
    return results

def process_all_json_files():
    """
    处理所有JSON文件
    """
    print("开始解析Label Studio JSON文件...")
    print("=" * 70)
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'train', 'images'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'train', 'labels'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'val', 'images'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'val', 'labels'), exist_ok=True)
    
    # 获取所有JSON文件
    json_files = sorted([f for f in os.listdir(JSON_DIR) if f.endswith('.json')])
    
    print(f"找到 {len(json_files)} 个JSON文件")
    print()
    
    all_results = {}
    
    for json_file in json_files:
        # 确定项目编号
        if 'project-1' in json_file:
            project_key = 'project-1'
        elif 'project-2' in json_file:
            project_key = 'project-2'
        elif 'project-3' in json_file:
            project_key = 'project-3'
        elif 'project-4' in json_file:
            project_key = 'project-4'
        elif 'project-5' in json_file:
            project_key = 'project-5'
        else:
            continue
        
        project_info = SCORE_DIMENSIONS[project_key]
        json_path = os.path.join(JSON_DIR, json_file)
        
        print(f"处理: {json_file} ({project_info['name']})")
        results = parse_json_file(json_path, project_info)
        
        print(f"  - 解析了 {len(results)} 张图片")
        
        # 统计评分信息
        if results:
            scores = [r['avg_score'] for r in results]
            print(f"  - 平均评分: {sum(scores)/len(scores):.2f}")
            print(f"  - 评分范围: {min(scores):.2f} - {max(scores):.2f}")
        
        all_results[project_key] = results
        print()
    
    # 保存结果
    output_file = os.path.join(OUTPUT_DIR, 'parsed_results.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    print("=" * 70)
    print(f"✅ 解析完成！结果保存至: {output_file}")
    print()
    
    # 打印统计信息
    print("统计信息:")
    for project_key, results in all_results.items():
        project_info = SCORE_DIMENSIONS[project_key]
        print(f"  {project_info['name']}: {len(results)} 张图片")
    
    return all_results

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    process_all_json_files()
