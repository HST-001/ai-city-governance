#!/usr/bin/env python3
"""
使用已提取的数据创建优化的数据集（节省磁盘空间）
"""

import os
import shutil
import glob
import random

def create_optimized_dataset():
    """创建优化的数据集"""

    print("=" * 70)
    print("📊 创建优化的数据集")
    print("=" * 70)
    print()

    # 已提取的目录
    extract_dir = 'label_studio_exports/extracted_all'
    images_dir = os.path.join(extract_dir, 'images')
    labels_dir = os.path.join(extract_dir, 'labels')

    # 检查目录是否存在
    if not os.path.exists(images_dir) or not os.path.exists(labels_dir):
        print("❌ 提取目录不存在")
        return

    # 获取所有图像文件
    image_files = glob.glob(os.path.join(images_dir, '*'))
    total_images = len(image_files)

    print(f"找到 {total_images} 个图像文件")
    print()

    if total_images == 0:
        print("❌ 没有找到图像文件，无法创建数据集")
        return

    # 新数据集目录（使用不同的名称）
    new_dataset_dir = 'data/yolo_dataset_optimized'
    if os.path.exists(new_dataset_dir):
        shutil.rmtree(new_dataset_dir)
    os.makedirs(new_dataset_dir, exist_ok=True)

    # 创建train/val/test目录
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(new_dataset_dir, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(new_dataset_dir, split, 'labels'), exist_ok=True)

    # 分割数据集：80%训练，10%验证，10%测试
    random.seed(42)
    random.shuffle(image_files)

    train_end = int(total_images * 0.8)
    val_end = int(total_images * 0.9)

    train_files = image_files[:train_end]
    val_files = image_files[train_end:val_end]
    test_files = image_files[val_end:]

    print(f"数据集分割:")
    print(f"  训练集: {len(train_files)} 张 ({len(train_files)/total_images*100:.1f}%)")
    print(f"  验证集: {len(val_files)} 张 ({len(val_files)/total_images*100:.1f}%)")
    print(f"  测试集: {len(test_files)} 张 ({len(test_files)/total_images*100:.1f}%)")
    print()

    # 复制文件
    def copy_files(files, split):
        """复制文件到指定分割"""
        success_count = 0
        error_count = 0

        for img_file in files:
            try:
                img_name = os.path.basename(img_file)

                # 复制图像
                target_img = os.path.join(new_dataset_dir, split, 'images', img_name)
                shutil.copy2(img_file, target_img)

                # 复制标注（如果存在）
                label_name = os.path.splitext(img_name)[0] + '.txt'
                label_file = os.path.join(labels_dir, label_name)

                if os.path.exists(label_file):
                    target_label = os.path.join(new_dataset_dir, split, 'labels', label_name)
                    shutil.copy2(label_file, target_label)
                else:
                    # 创建空标注文件
                    target_label = os.path.join(new_dataset_dir, split, 'labels', label_name)
                    open(target_label, 'w', encoding='utf-8').close()

                success_count += 1

            except Exception as e:
                print(f"  ❌ 复制失败 {os.path.basename(img_file)}: {e}")
                error_count += 1

        return success_count, error_count

    print("复制文件...")
    train_success, train_error = copy_files(train_files, 'train')
    print(f"  ✅ 训练集完成: {train_success} 成功, {train_error} 失败")

    val_success, val_error = copy_files(val_files, 'val')
    print(f"  ✅ 验证集完成: {val_success} 成功, {val_error} 失败")

    test_success, test_error = copy_files(test_files, 'test')
    print(f"  ✅ 测试集完成: {test_success} 成功, {test_error} 失败")
    print()

    # 创建dataset.yaml
    dataset_yaml = os.path.join(new_dataset_dir, 'dataset.yaml')
    yaml_content = f"""path: {os.path.abspath(new_dataset_dir)}
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
"""

    try:
        with open(dataset_yaml, 'w', encoding='utf-8') as f:
            f.write(yaml_content)
        print(f"✅ 配置文件创建成功: {dataset_yaml}")
    except Exception as e:
        print(f"❌ 配置文件创建失败: {e}")

    print("=" * 70)
    print(f"✅ 优化数据集创建完成")
    print(f"   位置: {new_dataset_dir}")
    print(f"   总图像数: {total_images}")
    print("=" * 70)
    print()

def main():
    """主函数"""

    # 切换到脚本目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # 创建优化数据集
    create_optimized_dataset()

    print("=" * 70)
    print("🎉 所有步骤完成！")
    print("=" * 70)
    print()
    print("下一步:")
    print("1. 检查数据集: python check_dataset.py")
    print("2. 开始训练: python train_model.py --data data/yolo_dataset_optimized/dataset.yaml")
    print()

if __name__ == '__main__':
    main()
