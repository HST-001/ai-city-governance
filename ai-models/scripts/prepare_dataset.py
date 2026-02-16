"""
YOLO数据集准备脚本
用于准备训练数据、划分数据集
"""

import os
import shutil
import random
from pathlib import Path
import logging
from typing import List, Tuple
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class YOLODatasetPreparer:
    """YOLO数据集准备器"""
    
    def __init__(self, yolo_dataset_dir: str, image_source_dir: str = None):
        self.yolo_dataset_dir = Path(yolo_dataset_dir)
        self.image_source_dir = Path(image_source_dir) if image_source_dir else None
        
        # 目录结构
        self.train_images_dir = self.yolo_dataset_dir / 'train' / 'images'
        self.train_labels_dir = self.yolo_dataset_dir / 'train' / 'labels'
        self.val_images_dir = self.yolo_dataset_dir / 'val' / 'images'
        self.val_labels_dir = self.yolo_dataset_dir / 'val' / 'labels'
        self.test_images_dir = self.yolo_dataset_dir / 'test' / 'images'
        self.test_labels_dir = self.yolo_dataset_dir / 'test' / 'labels'
        
        # 数据集划分比例
        self.train_ratio = 0.8
        self.val_ratio = 0.1
        self.test_ratio = 0.1
        
    def find_label_files(self) -> List[Path]:
        """查找所有标注文件"""
        # 从train/labels目录查找（转换脚本生成的）
        label_dir = self.yolo_dataset_dir / 'train' / 'labels'
        if not label_dir.exists():
            logger.warning(f"标注目录不存在: {label_dir}")
            return []
        
        label_files = list(label_dir.glob('*.txt'))
        logger.info(f"找到 {len(label_files)} 个标注文件")
        return label_files
    
    def find_image_files(self, label_files: List[Path]) -> List[Path]:
        """查找对应的图像文件"""
        image_files = []
        missing_images = []
        
        # 支持的图像格式
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        
        for label_file in label_files:
            # 获取task ID
            task_id = label_file.stem
            
            # 尝试查找对应的图像文件
            found = False
            
            # 1. 首先在指定的源目录查找
            if self.image_source_dir and self.image_source_dir.exists():
                for ext in image_extensions:
                    image_path = self.image_source_dir / f"{task_id}{ext}"
                    if image_path.exists():
                        image_files.append(image_path)
                        found = True
                        break
            
            # 2. 在常见位置查找
            if not found:
                common_search_paths = [
                    self.yolo_dataset_dir / 'images',
                    self.yolo_dataset_dir.parent / 'raw',
                    self.yolo_dataset_dir.parent / 'data' / 'raw',
                    Path.home() / 'Downloads',
                ]
                
                for search_path in common_search_paths:
                    if search_path.exists():
                        for ext in image_extensions:
                            image_path = search_path / f"{task_id}{ext}"
                            if image_path.exists():
                                image_files.append(image_path)
                                found = True
                                break
                    if found:
                        break
            
            if not found:
                missing_images.append(task_id)
        
        logger.info(f"找到 {len(image_files)} 个图像文件")
        if missing_images:
            logger.warning(f"缺失 {len(missing_images)} 个图像文件")
            if len(missing_images) <= 10:
                logger.warning(f"缺失的图像ID: {missing_images[:10]}")
            else:
                logger.warning(f"缺失的图像ID示例: {missing_images[:10]} ...")
        
        return image_files
    
    def split_dataset(self, image_files: List[Path]) -> Tuple[List[Path], List[Path], List[Path]]:
        """划分数据集"""
        # 随机打乱
        random.shuffle(image_files)
        
        # 计算划分数量
        total = len(image_files)
        train_count = int(total * self.train_ratio)
        val_count = int(total * self.val_ratio)
        test_count = total - train_count - val_count
        
        # 划分
        train_files = image_files[:train_count]
        val_files = image_files[train_count:train_count + val_count]
        test_files = image_files[train_count + val_count:]
        
        logger.info(f"数据集划分完成:")
        logger.info(f"  训练集: {len(train_files)} 个图像 ({len(train_files)/total*100:.1f}%)")
        logger.info(f"  验证集: {len(val_files)} 个图像 ({len(val_files)/total*100:.1f}%)")
        logger.info(f"  测试集: {len(test_files)} 个图像 ({len(test_files)/total*100:.1f}%)")
        
        return train_files, val_files, test_files
    
    def copy_files(self, image_files: List[Path], target_images_dir: Path, target_labels_dir: Path, split_name: str):
        """复制图像和标注文件到目标目录"""
        logger.info(f"开始复制 {split_name} 数据...")
        
        copied_count = 0
        missing_labels = []
        
        for image_file in image_files:
            try:
                # 复制图像
                target_image = target_images_dir / image_file.name
                shutil.copy2(image_file, target_image)
                
                # 复制标注文件
                task_id = image_file.stem
                label_file = self.yolo_dataset_dir / 'train' / 'labels' / f"{task_id}.txt"
                
                if label_file.exists():
                    target_label = target_labels_dir / label_file.name
                    shutil.copy2(label_file, target_label)
                    copied_count += 1
                else:
                    missing_labels.append(task_id)
                    
            except Exception as e:
                logger.error(f"复制文件失败 {image_file.name}: {e}")
        
        logger.info(f"{split_name} 数据复制完成: {copied_count} 个文件")
        if missing_labels:
            logger.warning(f"缺失 {len(missing_labels)} 个标注文件")
    
    def prepare_dataset(self):
        """准备数据集"""
        logger.info("=" * 80)
        logger.info("开始准备YOLO数据集")
        logger.info("=" * 80)
        
        # 1. 查找标注文件
        logger.info("\n步骤1: 查找标注文件")
        label_files = self.find_label_files()
        
        if not label_files:
            logger.error("未找到标注文件，请先运行数据转换脚本")
            return False
        
        # 2. 查找图像文件
        logger.info("\n步骤2: 查找图像文件")
        image_files = self.find_image_files(label_files)
        
        if not image_files:
            logger.error("未找到图像文件")
            logger.error("请确保图像文件存在，或使用 --image-source-dir 参数指定图像目录")
            logger.error("\n常见图像位置:")
            logger.error("  - data/raw/")
            logger.error("  - ~/Downloads/")
            logger.error("  - 或使用 Label Studio 导出的图像目录")
            return False
        
        # 3. 划分数据集
        logger.info("\n步骤3: 划分数据集")
        train_files, val_files, test_files = self.split_dataset(image_files)
        
        # 4. 复制文件
        logger.info("\n步骤4: 复制文件到目标目录")
        self.copy_files(train_files, self.train_images_dir, self.train_labels_dir, "训练集")
        self.copy_files(val_files, self.val_images_dir, self.val_labels_dir, "验证集")
        self.copy_files(test_files, self.test_images_dir, self.test_labels_dir, "测试集")
        
        # 5. 保存统计信息
        logger.info("\n步骤5: 保存统计信息")
        stats = {
            'total_images': len(image_files),
            'train_images': len(train_files),
            'val_images': len(val_files),
            'test_images': len(test_files),
            'train_ratio': self.train_ratio,
            'val_ratio': self.val_ratio,
            'test_ratio': self.test_ratio
        }
        
        stats_file = self.yolo_dataset_dir / 'dataset_stats.json'
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        logger.info(f"统计信息已保存: {stats_file}")
        
        logger.info("\n" + "=" * 80)
        logger.info("数据集准备完成！")
        logger.info("=" * 80)
        logger.info(f"\n数据集目录: {self.yolo_dataset_dir}")
        logger.info(f"  训练集: {self.train_images_dir}")
        logger.info(f"  验证集: {self.val_images_dir}")
        logger.info(f"  测试集: {self.test_images_dir}")
        logger.info(f"\n配置文件: {self.yolo_dataset_dir / 'dataset.yaml'}")
        
        return True
    
    def check_dataset(self):
        """检查数据集完整性"""
        logger.info("\n检查数据集完整性...")
        
        checks = {
            'train_images': len(list(self.train_images_dir.glob('*.*'))),
            'train_labels': len(list(self.train_labels_dir.glob('*.txt'))),
            'val_images': len(list(self.val_images_dir.glob('*.*'))),
            'val_labels': len(list(self.val_labels_dir.glob('*.txt'))),
            'test_images': len(list(self.test_images_dir.glob('*.*'))),
            'test_labels': len(list(self.test_labels_dir.glob('*.txt')))
        }
        
        logger.info("数据集统计:")
        logger.info(f"  训练集: {checks['train_images']} 图像, {checks['train_labels']} 标注")
        logger.info(f"  验证集: {checks['val_images']} 图像, {checks['val_labels']} 标注")
        logger.info(f"  测试集: {checks['test_images']} 图像, {checks['test_labels']} 标注")
        
        # 检查图像和标注数量是否匹配
        if checks['train_images'] != checks['train_labels']:
            logger.warning(f"训练集图像和标注数量不匹配!")
        if checks['val_images'] != checks['val_labels']:
            logger.warning(f"验证集图像和标注数量不匹配!")
        if checks['test_images'] != checks['test_labels']:
            logger.warning(f"测试集图像和标注数量不匹配!")
        
        return checks


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YOLO数据集准备脚本')
    parser.add_argument('--yolo-dataset-dir', type=str, default='data/yolo_dataset',
                        help='YOLO数据集目录')
    parser.add_argument('--image-source-dir', type=str, default=None,
                        help='图像源目录（如果图像不在默认位置）')
    parser.add_argument('--train-ratio', type=float, default=0.8,
                        help='训练集比例 (默认: 0.8)')
    parser.add_argument('--val-ratio', type=float, default=0.1,
                        help='验证集比例 (默认: 0.1)')
    parser.add_argument('--test-ratio', type=float, default=0.1,
                        help='测试集比例 (默认: 0.1)')
    parser.add_argument('--check-only', action='store_true',
                        help='仅检查数据集，不进行准备')
    
    args = parser.parse_args()
    
    # 创建准备器
    preparer = YOLODatasetPreparer(
        yolo_dataset_dir=args.yolo_dataset_dir,
        image_source_dir=args.image_source_dir
    )
    
    # 设置划分比例
    preparer.train_ratio = args.train_ratio
    preparer.val_ratio = args.val_ratio
    preparer.test_ratio = args.test_ratio
    
    # 检查或准备数据集
    if args.check_only:
        preparer.check_dataset()
    else:
        success = preparer.prepare_dataset()
        if success:
            preparer.check_dataset()
            print("\n下一步:")
            print("1. 检查数据集完整性")
            print("2. 开始训练YOLOv8模型:")
            print("   python scripts/train_yolov8.py")
        else:
            print("\n数据集准备失败，请检查错误信息")


if __name__ == '__main__':
    main()
