#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
简单版YOLOv8继续训练脚本
直接从指定的检查点继续训练
"""

from ultralytics import YOLO
import os

if __name__ == '__main__':
    # 检查点路径
    checkpoint_path = 'runs/detect/street_elements/yolov8n_training_optimized/weights/last.pt'
    
    # 检查检查点是否存在
    if os.path.exists(checkpoint_path):
        print(f"发现检查点文件: {checkpoint_path}")
        print("开始从检查点继续训练...")
        
        # 从检查点加载模型
        model = YOLO(checkpoint_path)
        print("模型加载成功！")
        
        # 训练配置
        train_config = {
            'data': 'data/yolo_dataset_final_fixed/dataset.yaml',
            'epochs': 25,  # 总epoch数保持不变
            'batch': 8,
            'imgsz': 640,
            'device': 'cpu',
            'save_period': 1,
            'verbose': True,
            'project': 'street_elements',
            'name': 'yolov8n_training_optimized',
            'exist_ok': True,
            'patience': 8,
            'resume': checkpoint_path  # 直接指定resume路径
        }
        
        print("训练配置:")
        for key, value in train_config.items():
            print(f"  {key}: {value}")
        
        print("\n开始训练...")
        print("=" * 60)
        
        # 开始训练
        try:
            results = model.train(**train_config)
            print("\n训练完成！")
        except KeyboardInterrupt:
            print("\n训练被用户中断")
        except Exception as e:
            print(f"\n训练过程中出现错误: {e}")
            
    else:
        print(f"错误：检查点文件不存在: {checkpoint_path}")
        print("请检查路径是否正确")
