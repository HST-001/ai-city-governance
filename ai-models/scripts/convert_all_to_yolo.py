"""
批量转换Label Studio标注到YOLO格式
支持多个项目JSON文件的批量转换
"""

import json
import os
import shutil
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MultiProjectLabelStudioToYOLOConverter:
    """多项目Label Studio到YOLO转换器"""
    
    def __init__(self, json_files: List[str], output_dir: str):
        self.json_files = json_files
        self.output_dir = Path(output_dir)
        
        # 类别映射（中英文对照）
        self.class_mapping = {
            '乔木': 0,
            '地被': 0,
            'tree': 0,
            '人行道': 1,
            'sidewalk': 1,
            '店招': 2,
            '店招/建筑': 2,
            'store sign': 2,
            '非机动车道': 3,
            '自行车道': 3,
            'Bicycle lane': 3,
            '城市设施': 4,
            '城市家具': 4,
            'urban facility': 4
        }
        
        # 类别名称（用于dataset.yaml）
        self.class_names = {
            0: 'tree',
            1: 'sidewalk',
            2: 'store sign',
            3: 'Bicycle lane',
            4: 'urban facility'
        }
        
        self._create_output_dirs()
        
    def _create_output_dirs(self):
        """创建输出目录结构"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'images').mkdir(exist_ok=True)
        (self.output_dir / 'labels').mkdir(exist_ok=True)
        (self.output_dir / 'train' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'train' / 'labels').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'labels').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'labels').mkdir(parents=True, exist_ok=True)
        
    def load_json_file(self, json_file: str) -> List[Dict]:
        """加载JSON文件"""
        logger.info(f"加载JSON文件: {json_file}")
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"找到 {len(data)} 个任务")
        return data
    
    def extract_annotations(self, task: Dict) -> List[Dict]:
        """提取标注信息"""
        annotations = []
        
        if not task.get('annotations'):
            return annotations
            
        for annotation in task['annotations']:
            if not annotation.get('result'):
                continue
                
            for result in annotation['result']:
                # 只处理多边形标注
                if result.get('type') == 'polygonlabels':
                    annotations.append({
                        'type': 'polygon',
                        'label': result['value']['polygonlabels'][0],
                        'points': result['value']['points'],
                        'original_width': result['original_width'],
                        'original_height': result['original_height']
                    })
                    
        return annotations
    
    def convert_polygon_to_yolo(self, polygon: Dict) -> str:
        """将多边形标注转换为YOLO格式"""
        points = polygon['points']
        width = polygon['original_width']
        height = polygon['original_height']
        
        # 转换为归一化坐标
        normalized_points = []
        for point in points:
            x_norm = point[0] / width
            y_norm = point[1] / height
            normalized_points.extend([x_norm, y_norm])
        
        # 获取类别ID
        label = polygon['label']
        class_id = self.class_mapping.get(label, 0)
        
        # 构建YOLO格式字符串
        yolo_line = f"{class_id} " + " ".join([f"{p:.6f}" for p in normalized_points])
        
        return yolo_line
    
    def save_yolo_annotation(self, task_id: int, annotations: List[Dict], split: str = 'train'):
        """保存YOLO格式标注"""
        yolo_lines = []
        
        for annotation in annotations:
            if annotation['type'] == 'polygon':
                yolo_line = self.convert_polygon_to_yolo(annotation)
                yolo_lines.append(yolo_line)
        
        if not yolo_lines:
            return False
            
        # 保存到对应的split目录
        label_file = self.output_dir / split / 'labels' / f"{task_id}.txt"
        with open(label_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(yolo_lines))
            
        return True
    
    def process_single_file(self, json_file: str, split: str = 'train') -> Dict:
        """处理单个JSON文件"""
        logger.info(f"开始处理文件: {json_file}")
        
        tasks = self.load_json_file(json_file)
        
        stats = {
            'total_tasks': len(tasks),
            'annotated_tasks': 0,
            'total_annotations': 0,
            'class_distribution': {k: 0 for k in self.class_mapping.values()}
        }
        
        for task in tasks:
            task_id = task.get('id', 0)
            annotations = self.extract_annotations(task)
            
            if annotations:
                self.save_yolo_annotation(task_id, annotations, split)
                stats['annotated_tasks'] += 1
                stats['total_annotations'] += len(annotations)
                
                # 统计类别分布
                for annotation in annotations:
                    if annotation['type'] == 'polygon':
                        label = annotation['label']
                        class_id = self.class_mapping.get(label, 0)
                        stats['class_distribution'][class_id] += 1
        
        logger.info(f"文件处理完成: {json_file}")
        logger.info(f"  总任务数: {stats['total_tasks']}")
        logger.info(f"  已标注任务: {stats['annotated_tasks']}")
        logger.info(f"  总标注数: {stats['total_annotations']}")
        
        return stats
    
    def convert_all(self, train_ratio: float = 0.8, val_ratio: float = 0.1):
        """转换所有JSON文件"""
        logger.info("=" * 80)
        logger.info("开始批量转换Label Studio标注到YOLO格式")
        logger.info("=" * 80)
        
        all_stats = {
            'total_files': len(self.json_files),
            'total_tasks': 0,
            'total_annotated_tasks': 0,
            'total_annotations': 0,
            'class_distribution': {k: 0 for k in self.class_mapping.values()},
            'file_stats': []
        }
        
        # 处理每个文件
        for i, json_file in enumerate(self.json_files):
            logger.info(f"\n处理文件 {i+1}/{len(self.json_files)}")
            
            # 简单划分：前80%训练，中间10%验证，最后10%测试
            # 这里为了简化，将所有文件都放到train，后续再手动划分
            stats = self.process_single_file(json_file, split='train')
            
            all_stats['total_tasks'] += stats['total_tasks']
            all_stats['total_annotated_tasks'] += stats['annotated_tasks']
            all_stats['total_annotations'] += stats['total_annotations']
            
            for class_id, count in stats['class_distribution'].items():
                all_stats['class_distribution'][class_id] += count
                
            all_stats['file_stats'].append({
                'file': os.path.basename(json_file),
                'stats': stats
            })
        
        # 创建dataset.yaml
        self._create_dataset_yaml()
        
        # 保存统计信息
        self._save_stats(all_stats)
        
        logger.info("=" * 80)
        logger.info("批量转换完成！")
        logger.info("=" * 80)
        logger.info(f"总文件数: {all_stats['total_files']}")
        logger.info(f"总任务数: {all_stats['total_tasks']}")
        logger.info(f"已标注任务: {all_stats['total_annotated_tasks']}")
        logger.info(f"总标注数: {all_stats['total_annotations']}")
        logger.info("\n类别分布:")
        for class_id, count in all_stats['class_distribution'].items():
            class_name = self.class_names.get(class_id, f"class_{class_id}")
            logger.info(f"  {class_name} (ID {class_id}): {count} 个标注")
        
        return all_stats
    
    def _create_dataset_yaml(self):
        """创建dataset.yaml配置文件"""
        yaml_content = f"""# YOLO数据集配置文件

# 数据集路径
path: {self.output_dir.absolute()}
train: train/images
val: val/images
test: test/images

# 类别数量
nc: {len(self.class_names)}

# 类别名称
names:
"""
        for class_id, class_name in sorted(self.class_names.items()):
            yaml_content += f"  {class_id}: {class_name}\n"
        
        yaml_file = self.output_dir / 'dataset.yaml'
        with open(yaml_file, 'w', encoding='utf-8') as f:
            f.write(yaml_content)
        
        logger.info(f"dataset.yaml已创建: {yaml_file}")
    
    def _save_stats(self, stats: Dict):
        """保存统计信息"""
        stats_file = self.output_dir / 'conversion_stats.json'
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        logger.info(f"统计信息已保存: {stats_file}")


def main():
    """主函数"""
    # JSON文件路径
    json_files = [
        'c:\\Users\\hy\\Downloads\\project-1-at-2026-01-27-23-07-203d9713.json',  # 绿化
        'c:\\Users\\hy\\Downloads\\project-2-at-2026-01-27-23-11-1391a670.json',  # 店招/建筑
        'c:\\Users\\hy\\Downloads\\project-3-at-2026-01-27-23-13-9bcb2cf0.json',  # 人行道
        'c:\\Users\\hy\\Downloads\\project-4-at-2026-01-27-23-13-9a41ec55.json',  # 非机动车道/自行车道
        'c:\\Users\\hy\\Downloads\\project-5-at-2026-01-27-23-14-a467e942.json'   # 城市设施/城市家具
    ]
    
    # 输出目录
    output_dir = 'data/yolo_dataset'
    
    # 创建转换器
    converter = MultiProjectLabelStudioToYOLOConverter(json_files, output_dir)
    
    # 执行转换
    stats = converter.convert_all()
    
    print("\n" + "=" * 80)
    print("转换完成！")
    print("=" * 80)
    print(f"数据集已保存到: {output_dir}")
    print(f"配置文件: {output_dir}/dataset.yaml")
    print(f"统计信息: {output_dir}/conversion_stats.json")
    print("\n下一步:")
    print("1. 将图像文件复制到对应的目录")
    print("2. 划分训练/验证/测试集")
    print("3. 开始训练YOLOv8模型")


if __name__ == '__main__':
    main()
