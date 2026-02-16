#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
YOLOv8训练进度监控脚本
"""

import os
import time
from pathlib import Path
import yaml

def monitor_training():
    """监控训练进度"""
    
    # 训练目录
    training_dir = Path("runs/detect/street_elements/yolov8n_training")
    weights_dir = training_dir / "weights"
    
    # 检查训练目录是否存在
    if not training_dir.exists():
        print("训练目录不存在，训练可能还未开始")
        return
    
    print("\n" + "="*60)
    print("YOLOv8训练进度监控")
    print("="*60)
    
    # 检查检查点文件
    print("\n检查点文件:")
    if weights_dir.exists():
        checkpoints = list(weights_dir.glob("*.pt"))
        for checkpoint in sorted(checkpoints):
            size_mb = checkpoint.stat().st_size / (1024 * 1024)
            mtime = checkpoint.stat().st_mtime
            import datetime
            mtime_str = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
            print(f"  {checkpoint.name:20s} - {size_mb:8.2f} MB - {mtime_str}")
    else:
        print("  暂无检查点文件")
    
    # 检查训练结果文件
    results_csv = training_dir / "results.csv"
    if results_csv.exists():
        print(f"\n训练结果文件: {results_csv.name}")
        with open(results_csv, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            if len(lines) > 1:
                print(f"  已完成 {len(lines)-1} 个epoch")
                
                # 显示最新的训练指标
                latest = lines[-1].strip().split(',')
                print(f"\n最新训练指标:")
                print(f"  Epoch: {latest[0]}")
                print(f"  训练损失: {latest[1]}")
                print(f"  验证损失: {latest[2]}")
                print(f"  mAP50: {latest[6]}")
                print(f"  mAP50-95: {latest[7]}")
    else:
        print("\n训练结果文件尚未生成")
    
    # 检查配置文件
    args_yaml = training_dir / "args.yaml"
    if args_yaml.exists():
        print(f"\n训练配置文件: {args_yaml.name}")
        with open(args_yaml, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
            print(f"  模型: {config.get('model')}")
            print(f"  数据集: {config.get('data')}")
            print(f"  训练轮数: {config.get('epochs')}")
            print(f"  批次大小: {config.get('batch')}")
            print(f"  图像大小: {config.get('imgsz')}")
            print(f"  设备: {config.get('device')}")
    
    print("\n" + "="*60)
    print("训练正在进行中...")
    print("每个epoch都会保存检查点")
    print("可以随时中断训练，使用 --resume 继续")
    print("="*60 + "\n")

if __name__ == '__main__':
    monitor_training()