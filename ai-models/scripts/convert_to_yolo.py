#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
数据转换脚本 - 将Label Studio JSON格式转换为YOLO格式
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import shutil

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class LabelStudioToYOLOConverter:
    """Label Studio JSON到YOLO格式转换器"""
    
    def __init__(self, label_studio_json_path: str, output_dir: str):
        """
        初始化转换器
        
        Args:
            label_studio_json_path: Label Studio JSON文件路径
            output_dir: YOLO格式输出目录
        """
        self.label_studio_json_path = label_studio_json_path
        self.output_dir = output_dir
        
        # 类别映射（包含中英文）
        self.class_mapping = {
            # 英文标签
            'tree': 0,
            'sidewalk': 1,
            'store sign': 2,
            'Bicycle lane': 3,
            'urban facility': 4,
            # 中文标签
            '乔木': 0,
            '地被': 0,
            '人行道': 1,
            '店招': 2,
            '自行车道': 3,
            '城市设施': 4,
            '城市家具': 4
        }
        
        # 反向映射
        self.class_names = {v: k for k, v in self.class_mapping.items()}
        
        # 创建输出目录
        self._create_output_dirs()
    
    def _create_output_dirs(self):
        """创建输出目录结构"""
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 创建images和labels目录
        self.images_dir = os.path.join(self.output_dir, 'images')
        self.labels_dir = os.path.join(self.output_dir, 'labels')
        
        os.makedirs(self.images_dir, exist_ok=True)
        os.makedirs(self.labels_dir, exist_ok=True)
        
        logger.info(f"输出目录结构已创建: {self.output_dir}")
    
    def load_label_studio_json(self) -> List[Dict]:
        """
        加载Label Studio JSON文件
        
        Returns:
            list: 任务列表
        """
        try:
            with open(self.label_studio_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            logger.info(f"成功加载Label Studio JSON文件，共{len(data)}个任务")
            return data
        except Exception as e:
            logger.error(f"加载Label Studio JSON文件失败: {e}")
            return []
    
    def extract_annotations(self, task: Dict) -> List[Dict]:
        """
        从任务中提取标注信息
        
        Args:
            task: 任务字典
            
        Returns:
            list: 标注列表
        """
        annotations = []
        
        if 'annotations' not in task:
            logger.warning(f"任务{task.get('id')}没有标注信息")
            return annotations
        
        for annotation in task['annotations']:
            if 'result' not in annotation:
                continue
            
            for result in annotation['result']:
                # 只处理多边形标注（polygonlabels）
                if result.get('type') == 'polygonlabels':
                    annotation_data = self._process_polygon_annotation(result, task)
                    if annotation_data:
                        annotations.append(annotation_data)
                # 也处理矩形标注（rectanglelabels）
                elif result.get('type') == 'rectanglelabels':
                    annotation_data = self._process_rectangle_annotation(result, task)
                    if annotation_data:
                        annotations.append(annotation_data)
        
        return annotations
    
    def _process_polygon_annotation(self, result: Dict, task: Dict) -> Dict:
        """
        处理多边形标注
        
        Args:
            result: 标注结果
            task: 任务字典
            
        Returns:
            dict: 处理后的标注数据
        """
        try:
            # 获取标签
            labels = result['value'].get('polygonlabels', [])
            if not labels:
                return None
            
            label = labels[0]
            if label not in self.class_mapping:
                logger.warning(f"未知标签: {label}")
                return None
            
            # 获取多边形点
            points = result['value'].get('points', [])
            if len(points) < 3:
                logger.warning(f"多边形点数不足: {len(points)}")
                return None
            
            # 获取图像尺寸
            image_width = result.get('original_width', 640)
            image_height = result.get('original_height', 640)
            
            # 转换为YOLO格式（归一化坐标）
            normalized_points = []
            for point in points:
                x = point['x'] / 100.0  # Label Studio使用百分比
                y = point['y'] / 100.0
                normalized_points.append([x, y])
            
            return {
                'type': 'polygon',
                'class_id': self.class_mapping[label],
                'class_name': label,
                'points': normalized_points,
                'image_width': image_width,
                'image_height': image_height
            }
        except Exception as e:
            logger.error(f"处理多边形标注失败: {e}")
            return None
    
    def _process_rectangle_annotation(self, result: Dict, task: Dict) -> Dict:
        """
        处理矩形标注
        
        Args:
            result: 标注结果
            task: 任务字典
            
        Returns:
            dict: 处理后的标注数据
        """
        try:
            # 获取标签
            labels = result['value'].get('rectanglelabels', [])
            if not labels:
                return None
            
            label = labels[0]
            if label not in self.class_mapping:
                logger.warning(f"未知标签: {label}")
                return None
            
            # 获取矩形坐标
            x = result['value'].get('x', 0) / 100.0
            y = result['value'].get('y', 0) / 100.0
            width = result['value'].get('width', 0) / 100.0
            height = result['value'].get('height', 0) / 100.0
            
            # 获取图像尺寸
            image_width = result.get('original_width', 640)
            image_height = result.get('original_height', 640)
            
            # 转换为YOLO格式（中心点坐标和宽高）
            center_x = x + width / 2
            center_y = y + height / 2
            
            return {
                'type': 'rectangle',
                'class_id': self.class_mapping[label],
                'class_name': label,
                'center_x': center_x,
                'center_y': center_y,
                'width': width,
                'height': height,
                'image_width': image_width,
                'image_height': image_height
            }
        except Exception as e:
            logger.error(f"处理矩形标注失败: {e}")
            return None
    
    def convert_to_yolo_format(self, annotations: List[Dict]) -> List[str]:
        """
        将标注转换为YOLO格式
        
        Args:
            annotations: 标注列表
            
        Returns:
            list: YOLO格式标注行
        """
        yolo_lines = []
        
        for annotation in annotations:
            if annotation['type'] == 'rectangle':
                # 矩形标注格式: class_id center_x center_y width height
                line = f"{annotation['class_id']} {annotation['center_x']:.6f} {annotation['center_y']:.6f} {annotation['width']:.6f} {annotation['height']:.6f}"
                yolo_lines.append(line)
            elif annotation['type'] == 'polygon':
                # 多边形标注格式: class_id x1 y1 x2 y2 ... xn yn
                points = annotation['points']
                coords = ' '.join([f"{p[0]:.6f} {p[1]:.6f}" for p in points])
                line = f"{annotation['class_id']} {coords}"
                yolo_lines.append(line)
        
        return yolo_lines
    
    def save_yolo_annotation(self, task_id: int, yolo_lines: List[str]):
        """
        保存YOLO格式标注文件
        
        Args:
            task_id: 任务ID
            yolo_lines: YOLO格式标注行
        """
        if not yolo_lines:
            return
        
        # 生成标注文件名
        label_filename = f"{task_id}.txt"
        label_path = os.path.join(self.labels_dir, label_filename)
        
        # 保存标注文件
        with open(label_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(yolo_lines))
        
        logger.debug(f"保存标注文件: {label_path}")
    
    def copy_image(self, task: Dict):
        """
        复制图像文件到输出目录
        
        Args:
            task: 任务字典
        """
        try:
            if 'data' not in task or 'image' not in task['data']:
                logger.warning(f"任务{task.get('id')}没有图像数据")
                return None
            
            image_url = task['data']['image']
            
            # 从URL中提取文件名
            if '/' in image_url:
                image_filename = image_url.split('/')[-1]
            else:
                image_filename = f"{task['id']}.jpg"
            
            # 生成新的文件名
            new_image_filename = f"{task['id']}{os.path.splitext(image_filename)[1]}"
            image_path = os.path.join(self.images_dir, new_image_filename)
            
            # 如果图像是本地路径，直接复制
            if os.path.exists(image_url):
                shutil.copy(image_url, image_path)
                logger.debug(f"复制图像文件: {image_url} -> {image_path}")
            else:
                # 如果是URL，记录警告（需要单独下载）
                logger.warning(f"图像URL需要单独下载: {image_url}")
            
            return image_path
        except Exception as e:
            logger.error(f"复制图像文件失败: {e}")
            return None
    
    def convert(self):
        """执行转换"""
        logger.info("开始转换Label Studio JSON到YOLO格式")
        
        # 加载Label Studio JSON
        tasks = self.load_label_studio_json()
        if not tasks:
            logger.error("没有任务数据，转换失败")
            return
        
        # 统计信息
        total_tasks = len(tasks)
        converted_tasks = 0
        total_annotations = 0
        
        # 转换每个任务
        for task in tasks:
            task_id = task.get('id')
            
            # 提取标注
            annotations = self.extract_annotations(task)
            
            if not annotations:
                logger.debug(f"任务{task_id}没有有效标注")
                continue
            
            # 转换为YOLO格式
            yolo_lines = self.convert_to_yolo_format(annotations)
            
            # 保存YOLO标注文件
            self.save_yolo_annotation(task_id, yolo_lines)
            
            # 复制图像文件
            self.copy_image(task)
            
            converted_tasks += 1
            total_annotations += len(annotations)
        
        # 生成数据集配置文件
        self._create_dataset_yaml()
        
        logger.info(f"转换完成: {converted_tasks}/{total_tasks}个任务, {total_annotations}个标注")
    
    def _create_dataset_yaml(self):
        """创建YOLO数据集配置文件"""
        yaml_path = os.path.join(self.output_dir, 'dataset.yaml')
        
        yaml_content = f"""# YOLO数据集配置文件

# 数据集路径
path: {os.path.abspath(self.output_dir)}
train: images
val: images

# 类别数量
nc: {len(self.class_mapping)}

# 类别名称
names:
"""
        
        # 添加类别名称
        for class_id in sorted(self.class_names.keys()):
            yaml_content += f"  {class_id}: {self.class_names[class_id]}\n"
        
        # 保存YAML文件
        with open(yaml_path, 'w', encoding='utf-8') as f:
            f.write(yaml_content)
        
        logger.info(f"数据集配置文件已创建: {yaml_path}")


def main():
    """主函数"""
    # 配置路径
    label_studio_json_path = r"C:\Users\hy\Downloads\project-1-at-2026-01-27-23-07-203d9713.json"
    output_dir = r"c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models\data\yolo_dataset"
    
    # 创建转换器
    converter = LabelStudioToYOLOConverter(label_studio_json_path, output_dir)
    
    # 执行转换
    converter.convert()
    
    logger.info("数据转换完成！")


if __name__ == '__main__':
    main()
