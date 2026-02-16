"""
合并Label Studio导出的YOLO格式数据
自动解压、合并、划分数据集
"""

import os
import shutil
import zipfile
from pathlib import Path
import random
import json
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class YOLODatasetMerger:
    """YOLO数据集合并器"""
    
    def __init__(self, export_dir: str, output_dir: str):
        self.export_dir = Path(export_dir)
        self.output_dir = Path(output_dir)
        
        # 类别映射（根据实际导出的classes.txt调整）
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
        
        # 创建输出目录
        self._create_output_dirs()
    
    def _create_output_dirs(self):
        """创建输出目录结构"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'train' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'train' / 'labels').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'labels').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'images').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'labels').mkdir(parents=True, exist_ok=True)
    
    def extract_zip(self, zip_path: Path) -> Path:
        """解压ZIP文件"""
        logger.info(f"解压文件: {zip_path.name}")
        
        extract_dir = self.export_dir / zip_path.stem
        extract_dir.mkdir(exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        logger.info(f"解压完成: {extract_dir}")
        return extract_dir
    
    def find_data_files(self, extract_dir: Path) -> tuple:
        """查找图像和标注文件"""
        images_dir = None
        labels_dir = None
        
        # 查找常见的目录结构
        for root, dirs, files in os.walk(extract_dir):
            if 'images' in dirs:
                images_dir = Path(root) / 'images'
            if 'labels' in dirs:
                labels_dir = Path(root) / 'labels'
        
        # 如果没有找到标准目录，尝试在根目录查找
        if not images_dir:
            image_files = list(extract_dir.rglob('*.jpg')) + list(extract_dir.rglob('*.png'))
            if image_files:
                images_dir = extract_dir
        
        if not labels_dir:
            label_files = list(extract_dir.rglob('*.txt'))
            if label_files:
                labels_dir = extract_dir
        
        return images_dir, labels_dir
    
    def get_image_files(self, images_dir: Path):
        """获取所有图像文件（包括没有扩展名的文件）"""
        # 查找所有文件，排除.txt和.json文件
        all_files = [f for f in images_dir.iterdir() if f.is_file()]
        logger.info(f"images目录总共有 {len(all_files)} 个文件")
        
        # 先尝试查找有扩展名的图像文件
        image_files = [f for f in all_files if f.suffix in ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG']]
        logger.info(f"找到 {len(image_files)} 个有扩展名的图像文件")
        
        # 如果没有找到有扩展名的图像文件，或者找到的很少，尝试查找没有扩展名的文件
        if len(image_files) < 10:  # 如果少于10个，说明可能大部分文件没有扩展名
            image_files = [f for f in all_files 
                          if f.suffix not in ['.txt', '.json'] 
                          and f.name != 'classes.txt']
            logger.info(f"使用所有非文本文件，共 {len(image_files)} 个图像文件")
        
        return image_files
    
    def copy_files(self, images_dir: Path, labels_dir: Path, split: str = 'train'):
        """复制文件到目标目录"""
        if not images_dir or not labels_dir:
            logger.warning(f"未找到图像或标注目录")
            return 0
        
        # 获取所有图像文件
        image_files = self.get_image_files(images_dir)
        
        copied_count = 0
        
        for image_file in image_files:
            # 查找对应的标注文件
            label_file = labels_dir / f"{image_file.name}.txt"
            
            if not label_file.exists():
                logger.warning(f"未找到标注文件: {label_file.name}")
                continue
            
            # 复制图像
            target_image = self.output_dir / split / 'images' / image_file.name
            shutil.copy2(image_file, target_image)
            
            # 复制标注
            target_label = self.output_dir / split / 'labels' / label_file.name
            shutil.copy2(label_file, target_label)
            
            copied_count += 1
        
        logger.info(f"复制了 {copied_count} 个文件到 {split}")
        return copied_count
    
    def split_and_copy(self, images_dir: Path, labels_dir: Path, project_name: str):
        """划分数据集并复制文件"""
        # 获取所有图像文件
        image_files = self.get_image_files(images_dir)
        
        if not image_files:
            logger.warning(f"未找到图像文件")
            return
        
        # 随机打乱
        random.shuffle(image_files)
        
        # 计算划分数量
        total = len(image_files)
        train_count = int(total * 0.8)
        val_count = int(total * 0.1)
        test_count = total - train_count - val_count
        
        logger.info(f"数据集划分: 总数={total}, 训练={train_count}, 验证={val_count}, 测试={test_count}")
        
        # 划分
        train_files = image_files[:train_count]
        val_files = image_files[train_count:train_count + val_count]
        test_files = image_files[train_count + val_count:]
        
        # 复制文件
        self._copy_split_files(train_files, labels_dir, 'train', project_name)
        self._copy_split_files(val_files, labels_dir, 'val', project_name)
        self._copy_split_files(test_files, labels_dir, 'test', project_name)
    
    def _is_obb_format(self, line: str) -> bool:
        """检测是否为OBB多边形格式"""
        parts = line.strip().split()
        # OBB格式通常包含类别ID + 8个坐标值（4个点）+ 可能的置信度
        return len(parts) >= 9
    
    def _convert_obb_to_yolo(self, line: str) -> str:
        """将OBB多边形格式转换为标准YOLO矩形框格式"""
        parts = line.strip().split()
        if len(parts) < 3:
            return line
        
        try:
            # 获取类别ID
            class_id = int(parts[0])
            logger.debug(f"原始类别ID: {class_id}")
            
            # 提取所有坐标值
            coords = []
            for part in parts[1:]:
                try:
                    coords.append(float(part))
                except ValueError:
                    break
            
            if len(coords) < 4:
                logger.warning(f"坐标值不足: {len(coords)}个，跳过该行")
                return ""
            
            # 计算边界框
            # 对于多边形，我们需要找到所有x和y的最小值和最大值
            # 提取所有x坐标（偶数索引）和y坐标（奇数索引）
            x_coords = coords[::2]
            y_coords = coords[1::2]
            
            if not x_coords or not y_coords:
                logger.warning(f"无法提取坐标，跳过该行")
                return ""
            
            min_x = min(x_coords)
            max_x = max(x_coords)
            min_y = min(y_coords)
            max_y = max(y_coords)
            
            # 计算中心点和宽高
            x_center = (min_x + max_x) / 2
            y_center = (min_y + max_y) / 2
            width = max_x - min_x
            height = max_y - min_y
            
            # 确保宽高为正数
            width = max(width, 0.001)
            height = max(height, 0.001)
            
            # 映射类别ID
            mapped_class_id = self._map_class_id(class_id)
            logger.debug(f"映射后类别ID: {mapped_class_id}")
            
            return f"{mapped_class_id} {x_center} {y_center} {width} {height}"
        except Exception as e:
            logger.error(f"转换OBB格式时出错: {e}")
            return ""
    
    def _map_class_id(self, class_id: int, project_name: str) -> int:
        """映射类别ID到目标范围"""
        # 根据项目名称动态映射类别ID
        mappings = {
            'project-1-greenery': {  # 绿化项目
                10: 0,  # 乔木/地被 (实际类别ID是10)
            },
            'project-2-store': {     # 店招项目
                10: 2,  # 店招/建筑 (实际类别ID是10)
            },
            'project-3-sidewalk': {   # 人行道项目
                10: 1,  # 人行道 (实际类别ID是10)
            },
            'project-4-bike': {       # 自行车道项目
                10: 3,  # 自行车道 (实际类别ID是10)
            },
            'project-5-facility': {   # 城市设施项目
                12: 4,  # 城市设施 (实际类别ID是12)
            }
        }
        
        # 获取当前项目的映射
        project_mapping = mappings.get(project_name, {})
        result = project_mapping.get(class_id, -1)  # -1表示未知类别
        
        logger.debug(f"映射类别ID: {class_id} -> {result} (项目: {project_name})")
        return result
    
    def _process_label_file(self, label_file: Path, project_name: str) -> list:
        """处理标注文件，转换格式和映射类别ID"""
        processed_lines = []
        
        try:
            with open(label_file, 'r', encoding='utf-8') as f:
                # 读取所有行
                lines = f.readlines()
                
                # 合并跨多行的标注
                merged_lines = []
                current_line = []
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    parts = line.split()
                    if parts:
                        # 如果当前行以数字开头，且current_line不为空，说明是一个新的标注
                        try:
                            # 尝试转换第一个部分为整数（类别ID）
                            int(parts[0])
                            # 如果是新的标注，保存当前的
                            if current_line:
                                merged_lines.append(' '.join(current_line))
                                current_line = []
                        except ValueError:
                            pass
                    
                    # 添加当前行的所有部分
                    current_line.extend(parts)
                
                # 保存最后一个标注
                if current_line:
                    merged_lines.append(' '.join(current_line))
                
                # 处理每个合并后的标注
                for merged_line in merged_lines:
                    parts = merged_line.split()
                    if not parts:
                        continue
                    
                    try:
                        # 获取类别ID
                        class_id = int(parts[0])
                        logger.debug(f"原始类别ID: {class_id}")
                        
                        # 提取坐标值
                        coords = []
                        for part in parts[1:]:
                            try:
                                coords.append(float(part))
                            except ValueError:
                                break
                        
                        if len(coords) < 4:
                            logger.warning(f"坐标值不足: {len(coords)}个，跳过该标注")
                            continue
                        
                        # 计算边界框
                        x_coords = coords[::2]
                        y_coords = coords[1::2]
                        
                        if not x_coords or not y_coords:
                            logger.warning(f"无法提取坐标，跳过该标注")
                            continue
                        
                        min_x = min(x_coords)
                        max_x = max(x_coords)
                        min_y = min(y_coords)
                        max_y = max(y_coords)
                        
                        # 计算中心点和宽高
                        x_center = (min_x + max_x) / 2
                        y_center = (min_y + max_y) / 2
                        width = max_x - min_x
                        height = max_y - min_y
                        
                        # 确保宽高为正数
                        width = max(width, 0.001)
                        height = max(height, 0.001)
                        
                        # 确保坐标在0-1范围内
                        x_center = max(0.0, min(1.0, x_center))
                        y_center = max(0.0, min(1.0, y_center))
                        width = max(0.0, min(1.0, width))
                        height = max(0.0, min(1.0, height))
                        
                        # 映射类别ID
                        mapped_class_id = self._map_class_id(class_id, project_name)
                        logger.debug(f"映射后类别ID: {mapped_class_id}")
                        
                        # 跳过未知类别
                        if mapped_class_id == -1:
                            logger.debug(f"跳过未知类别: {class_id}")
                            continue
                        
                        processed_line = f"{mapped_class_id} {x_center} {y_center} {width} {height}"
                        processed_lines.append(processed_line)
                    except ValueError as e:
                        logger.warning(f"处理标注时出错: {e}, 跳过该标注")
                    except Exception as e:
                        logger.error(f"处理标注时出错: {e}")
        except Exception as e:
            logger.error(f"处理标注文件时出错: {label_file.name}, 错误: {e}")
        
        return processed_lines
    
    def _copy_split_files(self, image_files: list, labels_dir: Path, split: str, project_name: str):
        """复制划分后的文件"""
        copied_count = 0
        
        for image_file in image_files:
            # 查找对应的标注文件
            # 尝试不同的标注文件命名方式
            label_file = labels_dir / f"{image_file.name}.txt"
            if not label_file.exists():
                label_file = labels_dir / f"{image_file.stem}.txt"
            
            if not label_file.exists():
                logger.warning(f"未找到标注文件: {label_file.name}")
                continue
            
            # 处理标注文件
            processed_lines = self._process_label_file(label_file, project_name)
            if not processed_lines:
                logger.warning(f"标注文件为空或处理失败: {label_file.name}")
                continue
            
            # 复制图像，添加.jpg扩展名
            image_name_with_ext = f"{image_file.name}.jpg"
            target_image = self.output_dir / split / 'images' / image_name_with_ext
            shutil.copy2(image_file, target_image)
            
            # 写入处理后的标注
            # 使用图像文件名（不含扩展名）作为标注文件名
            target_label_name = f"{image_file.name}.txt"
            target_label = self.output_dir / split / 'labels' / target_label_name
            with open(target_label, 'w', encoding='utf-8') as f:
                f.write('\n'.join(processed_lines) + '\n')
            
            copied_count += 1
        
        logger.info(f"复制了 {copied_count} 个文件到 {split}")
    
    def process_all_exports(self, zip_files: list):
        """处理所有导出的ZIP文件"""
        logger.info("=" * 80)
        logger.info("开始合并Label Studio导出的YOLO数据")
        logger.info("=" * 80)
        
        total_images = 0
        
        for i, zip_file in enumerate(zip_files):
            logger.info(f"\n处理文件 {i+1}/{len(zip_files)}: {zip_file.name}")
            
            # 从ZIP文件名提取项目名称（去掉.zip扩展名）
            project_name = zip_file.stem
            logger.info(f"项目名称: {project_name}")
            
            # 解压
            extract_dir = self.extract_zip(zip_file)
            
            # 查找数据文件
            images_dir, labels_dir = self.find_data_files(extract_dir)
            
            if images_dir and labels_dir:
                # 划分并复制
                self.split_and_copy(images_dir, labels_dir, project_name)
                
                # 统计
                image_count = len(list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png')))
                total_images += image_count
            else:
                logger.error(f"未找到图像或标注目录: {zip_file.name}")
        
        # 创建dataset.yaml
        self._create_dataset_yaml()
        
        # 统计信息
        self._print_stats()
        
        logger.info("\n" + "=" * 80)
        logger.info("合并完成！")
        logger.info("=" * 80)
        logger.info(f"总图像数: {total_images}")
        logger.info(f"输出目录: {self.output_dir}")
    
    def _create_dataset_yaml(self):
        """创建dataset.yaml配置文件"""
        yaml_content = f"""# YOLO数据集配置文件

# 数据集路径
path: {self.output_dir.absolute()}
train: train/images
val: val/images
test: test/images

# 类别数量
nc: 5

# 类别名称
names:
  0: tree
  1: sidewalk
  2: store sign
  3: Bicycle lane
  4: urban facility
"""
        
        yaml_file = self.output_dir / 'dataset.yaml'
        with open(yaml_file, 'w', encoding='utf-8') as f:
            f.write(yaml_content)
        
        logger.info(f"dataset.yaml已创建: {yaml_file}")
    
    def _print_stats(self):
        """打印统计信息"""
        train_images = len(list((self.output_dir / 'train' / 'images').glob('*.*')))
        train_labels = len(list((self.output_dir / 'train' / 'labels').glob('*.txt')))
        val_images = len(list((self.output_dir / 'val' / 'images').glob('*.*')))
        val_labels = len(list((self.output_dir / 'val' / 'labels').glob('*.txt')))
        test_images = len(list((self.output_dir / 'test' / 'images').glob('*.*')))
        test_labels = len(list((self.output_dir / 'test' / 'labels').glob('*.txt')))
        
        logger.info("\n数据集统计:")
        logger.info(f"  训练集: {train_images} 图像, {train_labels} 标注")
        logger.info(f"  验证集: {val_images} 图像, {val_labels} 标注")
        logger.info(f"  测试集: {test_images} 图像, {test_labels} 标注")
        logger.info(f"  总计: {train_images + val_images + test_images} 图像")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='合并Label Studio导出的YOLO数据')
    parser.add_argument('--export-dir', type=str, default='data/label_studio_exports',
                        help='Label Studio导出的ZIP文件目录')
    parser.add_argument('--output-dir', type=str, default='data/yolo_dataset',
                        help='输出目录')
    
    args = parser.parse_args()
    
    # 创建合并器
    merger = YOLODatasetMerger(args.export_dir, args.output_dir)
    
    # 查找所有ZIP文件
    export_dir = Path(args.export_dir)
    zip_files = list(export_dir.glob('*.zip'))
    
    if not zip_files:
        logger.error(f"未找到ZIP文件: {export_dir}")
        logger.error("请先将Label Studio导出的ZIP文件放到该目录")
        return
    
    logger.info(f"找到 {len(zip_files)} 个ZIP文件")
    for zip_file in zip_files:
        logger.info(f"  - {zip_file.name}")
    
    # 处理所有导出
    merger.process_all_exports(zip_files)
    
    print("\n下一步:")
    print("1. 检查数据集完整性")
    print("2. 开始训练YOLOv8模型:")
    print("   python scripts/train_yolov8.py")


if __name__ == '__main__':
    main()
