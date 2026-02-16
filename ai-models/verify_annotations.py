#!/usr/bin/env python3
"""
标注完整性验证脚本
用于详细检查所有类别的标注情况
"""

import os
import glob
from collections import Counter

def verify_annotation_completeness():
    """验证标注完整性"""
    print("=== 标注完整性验证 ===")
    
    data_path = 'data/yolo_dataset_final_fixed'
    if not os.path.exists(data_path):
        print("❌ 数据集目录不存在")
        return False
    
    # 统计每个类别的标注情况
    class_counter = Counter()
    file_counter = Counter()
    split_counter = Counter()
    
    splits = ['train', 'val', 'test']
    
    for split in splits:
        labels_path = os.path.join(data_path, f'{split}/labels')
        if os.path.exists(labels_path):
            label_files = glob.glob(os.path.join(labels_path, '*.txt'))
            split_counter[split] = len(label_files)
            
            print(f"\n=== {split}集检查 ===")
            print(f"标注文件数: {len(label_files)}")
            
            for label_file in label_files:
                with open(label_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                if lines:
                    file_counter['with_annotations'] += 1
                else:
                    file_counter['without_annotations'] += 1
                
                for line in lines:
                    line = line.strip()
                    if line:
                        try:
                            class_id = int(line.split()[0])
                            # 映射类别ID到类别名称
                            class_names = {
                                0: 'tree',
                                1: 'sidewalk',
                                2: 'store sign',
                                3: 'Bicycle lane',
                                4: 'urban facility'
                            }
                            class_name = class_names.get(class_id, f'class_{class_id}')
                            class_counter[class_name] += 1
                        except (ValueError, IndexError):
                            print(f"⚠️  标注格式错误: {label_file}")
    
    print("\n=== 详细统计 ===")
    print(f"训练集: {split_counter.get('train', 0)} 文件")
    print(f"验证集: {split_counter.get('val', 0)} 文件")
    print(f"测试集: {split_counter.get('test', 0)} 文件")
    print(f"总计: {sum(split_counter.values())} 文件")
    print(f"有标注的文件: {file_counter.get('with_annotations', 0)}")
    print(f"无标注的文件: {file_counter.get('without_annotations', 0)}")
    
    print("\n=== 类别标注分布 ===")
    print(f"{'类别':<20} {'标注数':<10} {'占比':<10}")
    print("-" * 40)
    
    total_annotations = sum(class_counter.values())
    
    for class_name, count in sorted(class_counter.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_annotations * 100) if total_annotations > 0 else 0
        print(f"{class_name:<20} {count:<10} {percentage:.1f}%")
    
    print("-" * 40)
    print(f"{'总计':<20} {total_annotations:<10} 100.0%")
    
    # 检查是否有缺失的类别
    expected_classes = {'tree', 'sidewalk', 'store sign', 'Bicycle lane', 'urban facility'}
    actual_classes = set(class_counter.keys())
    missing_classes = expected_classes - actual_classes
    
    if missing_classes:
        print(f"\n❌ 缺失的类别: {missing_classes}")
        return False
    else:
        print("\n✅ 所有类别都有标注")
    
    # 检查类别分布是否合理
    min_count = min(class_counter.values())
    max_count = max(class_counter.values())
    
    print(f"\n=== 类别分布分析 ===")
    print(f"最多标注的类别: {max(class_counter, key=class_counter.get)} ({max_count}个)")
    print(f"最少标注的类别: {min(class_counter, key=class_counter.get)} ({min_count}个)")
    print(f"分布差异: {max_count / min_count:.2f}倍")
    
    if max_count / min_count > 10:
        print("⚠️  类别分布差异较大，可能影响模型性能")
    else:
        print("✅ 类别分布相对合理")
    
    return True

def check_duplicate_files():
    """检查是否有重复的标注文件"""
    print("\n=== 重复文件检查 ===")
    
    data_path = 'data/yolo_dataset_final_fixed'
    all_label_files = []
    
    for split in ['train', 'val', 'test']:
        labels_path = os.path.join(data_path, f'{split}/labels')
        if os.path.exists(labels_path):
            label_files = glob.glob(os.path.join(labels_path, '*.txt'))
            all_label_files.extend(label_files)
    
    # 检查文件名重复
    filenames = [os.path.basename(f) for f in all_label_files]
    filename_counter = Counter(filenames)
    duplicates = [name for name, count in filename_counter.items() if count > 1]
    
    if duplicates:
        print(f"❌ 发现 {len(duplicates)} 个重复的标注文件名")
        print(f"前5个重复文件: {duplicates[:5]}")
    else:
        print("✅ 无重复标注文件名")
    
    return len(duplicates) == 0

def main():
    """主函数"""
    print("🚀 开始标注完整性验证...")
    print("=" * 60)
    
    # 验证标注完整性
    annotation_ok = verify_annotation_completeness()
    
    # 检查重复文件
    duplicate_ok = check_duplicate_files()
    
    print("=" * 60)
    if annotation_ok and duplicate_ok:
        print("✅ 标注完整性验证通过!")
        print("所有类别都有充足的标注数据")
    else:
        print("❌ 标注完整性验证失败!")
        print("请检查上述问题并修复")

if __name__ == '__main__':
    main()
