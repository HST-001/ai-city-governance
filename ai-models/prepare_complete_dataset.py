#!/usr/bin/env python3
"""
从ZIP文件中提取完整数据并合并重复图像的标注
"""

import os
import shutil
import zipfile
import glob
import random
from collections import defaultdict

def extract_and_merge_data():
    """提取并合并数据"""

    print("=" * 70)
    print("📦 提取并合并数据")
    print("=" * 70)
    print()

    # 创建临时提取目录
    extract_dir = 'label_studio_exports/extracted_all'
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir, exist_ok=True)

    # 创建子目录
    images_dir = os.path.join(extract_dir, 'images')
    labels_dir = os.path.join(extract_dir, 'labels')
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(labels_dir, exist_ok=True)

    # ZIP文件列表
    zip_files = [
        ('project-1-greenery.zip', 0),
        ('project-2-store.zip', 2),
        ('project-3-sidewalk.zip', 1),
        ('project-4-bike.zip', 3),
        ('project-5-facility.zip', 4)
    ]

    # 存储所有标注
    all_labels = defaultdict(list)

    for zip_file, class_id in zip_files:
        zip_path = os.path.join('label_studio_exports', zip_file)

        if not os.path.exists(zip_path):
            print(f"❌ ZIP文件不存在: {zip_file}")
            continue

        print(f"📦 处理: {zip_file} (类别ID: {class_id})")

        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                file_list = zf.namelist()

                # 提取图像和标注
                for file_path in file_list:
                    # 跳过目录
                    if file_path.endswith('/'):
                        continue

                    try:
                        if file_path.startswith('images/'):
                            # 图像文件
                            filename = os.path.basename(file_path)
                            target_path = os.path.join(images_dir, filename)

                            # 只提取一次图像
                            if not os.path.exists(target_path):
                                with zf.open(file_path) as source, open(target_path, 'wb') as target:
                                    shutil.copyfileobj(source, target)

                        elif file_path.startswith('labels/') and not file_path.endswith('/'):
                            # 标注文件
                            filename = os.path.basename(file_path)
                            label_name = filename.replace('.txt', '')

                            # 读取标注内容
                            with zf.open(file_path) as source:
                                content = source.read().decode('utf-8')

                            # 合并标注（修改类别ID）
                            for line in content.strip().split('\n'):
                                if line.strip():
                                    parts = line.strip().split()
                                    if len(parts) >= 5:
                                        # 修改类别ID
                                        parts[0] = str(class_id)
                                        all_labels[label_name].append(' '.join(parts))

                    except Exception as e:
                        print(f"  ⚠️  处理失败 {file_path}: {e}")
                        continue

                print(f"   处理: {len(file_list)} 个文件")

        except Exception as e:
            print(f"   ❌ 提取失败: {e}")
            import traceback
            traceback.print_exc()

        print()

    # 合并标注文件
    print("🔧 合并标注文件...")
    merged_count = 0
    for label_name, annotations in all_labels.items():
        label_file = os.path.join(labels_dir, label_name + '.txt')
        with open(label_file, 'w', encoding='utf-8') as f:
            for annotation in annotations:
                f.write(annotation + '\n')
        merged_count += 1

    print(f"   合并: {merged_count} 个标注文件")
    print()

    print("=" * 70)
    print(f"✅ 提取完成")
    print(f"   保存位置: {extract_dir}")
    print("=" * 70)
    print()

    return extract_dir

def fix_image_extensions(extract_dir):
    """修复图像文件扩展名"""

    print("=" * 70)
    print("🔧 修复图像文件扩展名")
    print("=" * 70)
    print()

    images_dir = os.path.join(extract_dir, 'images')

    if not os.path.exists(images_dir):
        print("❌ 图像目录不存在")
        return

    # 获取所有文件
    files = os.listdir(images_dir)
    print(f"找到 {len(files)} 个文件")

    fixed_count = 0
    skipped_count = 0
    error_count = 0

    for filename in files:
        file_path = os.path.join(images_dir, filename)

        # 跳过目录
        if os.path.isdir(file_path):
            continue

        # 检查是否已经有扩展名
        if '.' in filename:
            skipped_count += 1
            continue

        # 检测图像格式
        try:
            from PIL import Image
            with Image.open(file_path) as img:
                image_format = img.format.lower()

            # 确定扩展名
            if image_format == 'jpeg':
                extension = '.jpg'
            else:
                extension = f'.{image_format}'

            # 新文件名
            new_filename = filename + extension
            new_file_path = os.path.join(images_dir, new_filename)

            # 检查新文件名是否已存在
            if os.path.exists(new_file_path):
                print(f"  ⚠️  目标文件已存在，跳过: {new_filename}")
                skipped_count += 1
                continue

            # 重命名文件
            os.rename(file_path, new_file_path)
            fixed_count += 1

        except Exception as e:
            print(f"  ❌ 处理失败 {filename}: {e}")
            error_count += 1

    print()
    print(f"✅ 修复完成")
    print(f"   修复: {fixed_count} 个文件")
    print(f"   跳过: {skipped_count} 个文件")
    print(f"   错误: {error_count} 个文件")
    print("=" * 70)
    print()

def create_complete_dataset(extract_dir):
    """创建完整的数据集"""

    print("=" * 70)
    print("📊 创建完整的数据集")
    print("=" * 70)
    print()

    # 新数据集目录
    new_dataset_dir = 'data/yolo_dataset_complete'
    if os.path.exists(new_dataset_dir):
        shutil.rmtree(new_dataset_dir)
    os.makedirs(new_dataset_dir, exist_ok=True)

    # 创建train/val/test目录
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(new_dataset_dir, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(new_dataset_dir, split, 'labels'), exist_ok=True)

    # 获取所有图像和标注
    images_dir = os.path.join(extract_dir, 'images')
    labels_dir = os.path.join(extract_dir, 'labels')

    image_files = glob.glob(os.path.join(images_dir, '*'))

    print(f"找到 {len(image_files)} 个图像文件")
    print()

    if len(image_files) == 0:
        print("❌ 没有找到图像文件，无法创建数据集")
        return

    # 分割数据集：80%训练，10%验证，10%测试
    random.seed(42)
    random.shuffle(image_files)

    total = len(image_files)
    train_end = int(total * 0.8)
    val_end = int(total * 0.9)

    train_files = image_files[:train_end]
    val_files = image_files[train_end:val_end]
    test_files = image_files[val_end:]

    print(f"数据集分割:")
    print(f"  训练集: {len(train_files)} 张 ({len(train_files)/total*100:.1f}%)")
    print(f"  验证集: {len(val_files)} 张 ({len(val_files)/total*100:.1f}%)")
    print(f"  测试集: {len(test_files)} 张 ({len(test_files)/total*100:.1f}%)")
    print()

    # 复制文件
    def copy_files(files, split):
        """复制文件到指定分割"""
        for img_file in files:
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

    print("复制文件...")
    copy_files(train_files, 'train')
    print(f"  ✅ 训练集完成")
    copy_files(val_files, 'val')
    print(f"  ✅ 验证集完成")
    copy_files(test_files, 'test')
    print(f"  ✅ 测试集完成")
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

    with open(dataset_yaml, 'w', encoding='utf-8') as f:
        f.write(yaml_content)

    print("=" * 70)
    print(f"✅ 完整数据集创建完成")
    print(f"   位置: {new_dataset_dir}")
    print(f"   配置文件: {dataset_yaml}")
    print("=" * 70)
    print()

def main():
    """主函数"""

    # 1. 提取并合并数据
    extract_dir = extract_and_merge_data()

    # 2. 修复图像扩展名
    fix_image_extensions(extract_dir)

    # 3. 创建完整数据集
    create_complete_dataset(extract_dir)

    print("=" * 70)
    print("🎉 所有步骤完成！")
    print("=" * 70)
    print()
    print("下一步:")
    print("1. 检查数据集: python check_complete_dataset.py")
    print("2. 开始训练: python train_complete_dataset.py")
    print()

if __name__ == '__main__':
    import sys
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
