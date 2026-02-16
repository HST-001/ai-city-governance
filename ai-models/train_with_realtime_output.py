#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
实时显示YOLOv8训练进度的脚本
"""

import os
import sys
import time
from pathlib import Path
import subprocess

def start_training_with_output():
    """启动训练并实时显示输出"""
    
    print("\n" + "="*60)
    print("YOLOv8训练启动 - 实时显示进度")
    print("="*60 + "\n")
    
    # 训练命令
    cmd = [
        sys.executable, "-c",
        """
import sys
import os
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

from ultralytics import YOLO

model = YOLO('yolov8n.pt')

print("开始训练YOLOv8模型...")
print("训练配置:")
print("  模型: yolov8n.pt")
print("  数据集: data/yolo_dataset_final_fixed/dataset.yaml")
print("  训练轮数: 100")
print("  批次大小: 16")
print("  图像大小: 640x640")
print("  设备: CPU")
print("  检查点保存: 每个epoch")
print("="*60)
print()

results = model.train(
    data='data/yolo_dataset_final_fixed/dataset.yaml',
    epochs=100,
    batch=16,
    imgsz=640,
    device='cpu',
    save_period=1,
    verbose=True
)

print("\\n训练完成！")
        """
    ]
    
    # 启动训练进程
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,  # 行缓冲
        universal_newlines=True
    )
    
    print("训练进程已启动 (PID: {})".format(process.pid))
    print("实时输出如下:\n")
    print("="*60 + "\n")
    
    try:
        # 实时读取输出
        for line in process.stdout:
            print(line, end='')
            sys.stdout.flush()
            
    except KeyboardInterrupt:
        print("\n\n训练被用户中断")
        print("已保存的检查点可用于后续继续训练")
        process.terminate()
        
    finally:
        process.wait()
        print("\n" + "="*60)
        print("训练进程结束")
        print("退出代码:", process.returncode)
        print("="*60 + "\n")

if __name__ == '__main__':
    start_training_with_output()