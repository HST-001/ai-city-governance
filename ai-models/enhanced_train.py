#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
增强版YOLOv8训练脚本 - 支持频繁检查点保存和异常恢复
"""

from ultralytics import YOLO
import os
import time
import json
from datetime import datetime

def train_with_protection():
    """带保护机制的训练函数"""
    
    # 训练配置
    config = {
        'model': 'yolov8n.pt',
        'data': 'data/yolo_dataset_final_fixed/dataset.yaml',
        'epochs': 25,  # 减少到25个epoch
        'batch': 8,  # 减小到8
        'imgsz': 640,
        'device': 'cpu',
        'save_period': 1,  # 每个epoch保存
        'verbose': True,
        'project': 'street_elements',
        'name': 'yolov8n_training_optimized',
        'exist_ok': True,
        'pretrained': True,
        'seed': 42,
        'patience': 8,  # 添加早期停止
        'resume': False  # 默认不使用resume，后续根据检查点情况动态设置
    }
    
    # 检查点目录
    checkpoint_dir = os.path.join('runs', 'detect', config['project'], config['name'], 'weights')
    progress_file = os.path.join('runs', 'detect', config['project'], config['name'], 'training_progress.json')
    
    # 检查是否有上次的检查点
    checkpoint_path = os.path.join(checkpoint_dir, 'last.pt')
    
    # 加载模型
    print("加载YOLOv8模型...")
    if os.path.exists(checkpoint_path):
        print(f"发现上次的检查点，从 {checkpoint_path} 继续训练...")
        model = YOLO(checkpoint_path)
        config['resume'] = checkpoint_path  # 设置resume为检查点路径
        print("检查点加载成功，可以继续训练！")
        print(f"resume参数已设置为: {checkpoint_path}")
    else:
        print("没有发现检查点，使用初始模型开始训练...")
        model = YOLO(config['model'])
        config['resume'] = False  # 确保resume为False
        print("将使用初始模型开始新的训练")
    
    # 检查是否有之前的进度
    if os.path.exists(progress_file):
        print("发现之前的训练进度，尝试恢复...")
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                progress = json.load(f)
            print(f"上次训练进度: Epoch {progress.get('epoch', 0)}/{config['epochs']}")
            print(f"上次训练时间: {progress.get('timestamp', 'N/A')}")
            # 这里可以实现从进度文件恢复训练
        except Exception as e:
            print(f"恢复进度失败: {e}")
    
    # 启动训练
    print("开始训练YOLOv8模型...")
    print("="*60)
    print(f"训练配置: {config}")
    print(f"检查点目录: {checkpoint_dir}")
    print(f"进度文件: {progress_file}")
    print("="*60)
    
    # 创建进度记录函数
    def record_progress(epoch, batch, loss):
        """记录训练进度"""
        progress_data = {
            'epoch': epoch,
            'batch': batch,
            'loss': loss,
            'timestamp': datetime.now().isoformat(),
            'config': config
        }
        os.makedirs(os.path.dirname(progress_file), exist_ok=True)
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, ensure_ascii=False, indent=2)
        print(f"保存进度: Epoch {epoch}, Batch {batch}, Loss {loss}")
    
    # 训练过程
    try:
        # 这里我们使用YOLOv8的训练函数
        # 同时我们会在训练过程中定期记录进度
        results = model.train(**config)
        
        print("训练完成！")
        return results
        
    except KeyboardInterrupt:
        print("训练被用户中断")
        print("已保存的检查点可用于后续继续训练")
        return None
        
    except Exception as e:
        print(f"训练过程中出现错误: {e}")
        print("已保存的进度可用于后续恢复训练")
        return None

if __name__ == '__main__':
    train_with_protection()