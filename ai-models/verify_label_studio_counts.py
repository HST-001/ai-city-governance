#!/usr/bin/env python3
"""
Label Studio标注数量验证脚本
验证各个项目的标注文件数量是否与用户提供的数据一致
"""

import os
import glob

def verify_label_studio_counts():
    """验证Label Studio标注数量"""
    print("=== Label Studio标注数量验证 ===")
    
    # 用户提供的标注数量
    expected_counts = {
        'project-1-greenery': 975,  # city plant项目
        'project-2-store': 945,     # store sign项目
        'project-3-sidewalk': 872,   # sidewalk项目
        'project-4-bike': 870,       # bicycle lane项目
        'project-5-facility': 887    # urban facilities项目
    }
    
    # 项目名称映射
    project_names = {
        'project-1-greenery': 'city plant',
        'project-2-store': 'store sign',
        'project-3-sidewalk': 'sidewalk',
        'project-4-bike': 'bicycle lane',
        'project-5-facility': 'urban facilities'
    }
    
    # 检查每个项目的标注数量
    actual_counts = {}
    base_path = 'label_studio_exports'
    
    for project_dir, expected_count in expected_counts.items():
        project_path = os.path.join(base_path, project_dir)
        
        if os.path.exists(project_path):
            # 检查labels目录
            labels_path = os.path.join(project_path, 'labels')
            if os.path.exists(labels_path):
                label_files = glob.glob(os.path.join(labels_path, '*.txt'))
                actual_count = len(label_files)
                actual_counts[project_dir] = actual_count
                
                # 统计空标注文件数量
                empty_count = 0
                for label_file in label_files:
                    if os.path.getsize(label_file) == 0:
                        empty_count += 1
                
                # 统计非空标注文件数量
                non_empty_count = actual_count - empty_count
                
                project_name = project_names.get(project_dir, project_dir)
                print(f"\n=== {project_name}项目 ===")
                print(f"期望标注数: {expected_count}")
                print(f"实际标注数: {actual_count}")
                print(f"空标注文件数: {empty_count}")
                print(f"非空标注文件数: {non_empty_count}")
                
                # 验证是否一致
                if actual_count == expected_count:
                    print("✅ 标注数量一致")
                else:
                    print(f"❌ 标注数量不一致，差异: {abs(actual_count - expected_count)}")
            else:
                print(f"❌ {project_names.get(project_dir, project_dir)}项目缺少labels目录")
        else:
            print(f"❌ {project_names.get(project_dir, project_dir)}项目目录不存在")
    
    # 检查最终数据集的完整性
    print("\n=== 最终数据集完整性检查 ===")
    final_data_path = 'data/yolo_dataset_final_fixed'
    
    if os.path.exists(final_data_path):
        total_images = 0
        splits = ['train', 'val', 'test']
        
        for split in splits:
            images_path = os.path.join(final_data_path, f'{split}/images')
            if os.path.exists(images_path):
                images = glob.glob(os.path.join(images_path, '*'))
                count = len(images)
                total_images += count
                print(f"{split}集: {count} 个图像")
        
        print(f"\n最终数据集总图像数: {total_images}")
        
        # 检查标注文件
        total_labels = 0
        for split in splits:
            labels_path = os.path.join(final_data_path, f'{split}/labels')
            if os.path.exists(labels_path):
                labels = glob.glob(os.path.join(labels_path, '*.txt'))
                count = len(labels)
                total_labels += count
        
        print(f"最终数据集总标注文件数: {total_labels}")
        
        if total_images == total_labels:
            print("✅ 每个图像都有对应的标注文件")
        else:
            print(f"❌ 图像和标注文件数量不一致，差异: {abs(total_images - total_labels)}")
    else:
        print("❌ 最终数据集目录不存在")
    
    # 验证跨项目的图像一致性
    print("\n=== 跨项目图像一致性检查 ===")
    all_images = {}
    
    for project_dir in expected_counts.keys():
        project_path = os.path.join(base_path, project_dir)
        if os.path.exists(project_path):
            images_path = os.path.join(project_path, 'images')
            if os.path.exists(images_path):
                images = glob.glob(os.path.join(images_path, '*'))
                project_name = project_names.get(project_dir, project_dir)
                image_names = [os.path.basename(img) for img in images]
                all_images[project_name] = image_names
                print(f"{project_name}: {len(image_names)} 个图像")
    
    # 检查所有项目共有的图像
    if all_images:
        # 获取第一个项目的图像列表作为基准
        first_project = list(all_images.keys())[0]
        common_images = set(all_images[first_project])
        
        # 检查其他项目
        for project_name, image_names in all_images.items():
            if project_name != first_project:
                common_images.intersection_update(image_names)
        
        print(f"\n所有项目共有的图像数: {len(common_images)}")
        
        # 检查每个项目独有的图像
        for project_name, image_names in all_images.items():
            unique_images = set(image_names) - common_images
            print(f"{project_name}独有的图像数: {len(unique_images)}")

def main():
    """主函数"""
    print("🚀 开始验证Label Studio标注数量...")
    print("=" * 60)
    
    verify_label_studio_counts()
    
    print("=" * 60)
    print("✅ 验证完成")

if __name__ == '__main__':
    main()
