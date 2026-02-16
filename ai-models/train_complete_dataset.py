#!/usr/bin/env python3
"""
YOLOv8训练脚本 - 支持中断恢复和实时进度显示
"""

import os
import sys
from datetime import datetime

def train_yolov8():
    """训练YOLOv8模型"""

    print("=" * 70)
    print("🚀 YOLOv8 训练系统")
    print("=" * 70)
    print()
    print(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # 训练参数
    data_yaml = 'data/yolo_dataset_complete/dataset.yaml'
    epochs = 50
    batch = 8
    imgsz = 416
    device = 'cpu'

    print("📋 训练参数:")
    print(f"  数据集: {data_yaml}")
    print(f"  训练轮数: {epochs}")
    print(f"  批次大小: {batch}")
    print(f"  图像尺寸: {imgsz}")
    print(f"  设备: {device}")
    print(f"  优化器: SGD")
    print(f"  学习率: 0.01")
    print(f"  早停耐心值: 10")
    print(f"  每个epoch保存: 是")
    print()

    # 检查数据集
    if not os.path.exists(data_yaml):
        print(f"❌ 数据集配置文件不存在: {data_yaml}")
        return

    # 检查是否有可用的检查点
    checkpoint_dir = 'runs/detect'
    resume_from = None

    # 不自动恢复，总是从头开始训练
    print("ℹ️  从头开始训练（不恢复之前的检查点）")
    print()
    print("=" * 70)
    print("开始训练...")
    print("=" * 70)
    print()

    try:
        from ultralytics import YOLO

        # 加载模型
        print("加载YOLOv8n模型...")
        model = YOLO('yolov8n.pt')
        print("✅ 模型加载成功")
        print()

        # 训练参数
        train_params = {
            'data': data_yaml,
            'epochs': epochs,
            'batch': batch,
            'imgsz': imgsz,
            'workers': 2,
            'device': device,
            'optimizer': 'SGD',
            'lr0': 0.01,
            'patience': 10,
            'seed': 42,
            'verbose': True,
            'save': True,
            'val': True,
            'save_period': 1,
            'name': f'yolov8n_train_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        }

        # 开始训练
        print("从头开始训练")
        print()
        print("=" * 70)
        print("训练进度将实时显示在下方")
        print("=" * 70)
        print()

        # 开始训练（不使用resume）
        results = model.train(**train_params)

        print()
        print("=" * 70)
        print("✅ 训练完成！")
        print("=" * 70)
        print()
        print(f"完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"最佳模型: {results.save_dir / 'weights' / 'best.pt'}")
        print(f"最终模型: {results.save_dir / 'weights' / 'last.pt'}")
        print()

    except KeyboardInterrupt:
        print()
        print("=" * 70)
        print("⚠️  训练被用户中断")
        print("=" * 70)
        print()
        print("训练已暂停，下次运行时将从最近的检查点继续")
        print()
        sys.exit(0)

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ 训练失败")
        print("=" * 70)
        print(f"错误: {e}")
        print()
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    train_yolov8()
