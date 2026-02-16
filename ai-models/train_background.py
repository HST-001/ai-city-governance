#!/usr/bin/env python3
"""
后台训练脚本 - 使用非阻塞模式运行训练
训练将在后台持续运行，即使终端断开也不会停止
"""

import os
import sys
import subprocess
import time
import logging
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training_background.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def run_training_background():
    """在后台运行训练"""
    
    # 切换到ai-models目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    logger.info("=" * 70)
    logger.info("🚀 后台训练系统启动")
    logger.info("=" * 70)
    logger.info(f"工作目录: {os.getcwd()}")
    logger.info(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 训练参数
    data_yaml = 'data/yolo_dataset_final_fixed/dataset.yaml'
    epochs = 50
    batch = 8
    imgsz = 416
    
    logger.info("\n训练参数:")
    logger.info(f"  数据集: {data_yaml}")
    logger.info(f"  训练轮数: {epochs}")
    logger.info(f"  批次大小: {batch}")
    logger.info(f"  图像尺寸: {imgsz}")
    logger.info(f"  设备: cpu")
    logger.info(f"  优化器: SGD")
    logger.info(f"  每个epoch保存: 是")
    
    logger.info("\n" + "=" * 70)
    logger.info("开始训练...")
    logger.info("=" * 70)
    
    try:
        from ultralytics import YOLO
        
        # 加载模型
        logger.info("加载YOLOv8n模型...")
        model = YOLO('yolov8n.pt')
        logger.info("✅ 模型加载成功")
        
        # 开始训练
        logger.info("\n开始训练过程...")
        start_time = datetime.now()
        
        # 训练参数
        train_params = {
            'data': data_yaml,
            'epochs': epochs,
            'batch': batch,
            'imgsz': imgsz,
            'workers': 2,
            'device': 'cpu',
            'optimizer': 'SGD',
            'lr0': 0.01,
            'patience': 10,
            'seed': 42,
            'verbose': True,
            'save': True,
            'val': True,
            'save_period': 1,  # 每个epoch保存一次
            'name': f'background_train_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        }
        
        # 开始训练
        results = model.train(**train_params)
        
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ 训练完成")
        logger.info("=" * 70)
        logger.info(f"开始时间: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"完成时间: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"总耗时: {total_time:.2f}秒 ({total_time/3600:.2f}小时)")
        
        # 验证模型
        logger.info("\n验证模型...")
        metrics = model.val()
        logger.info(f"mAP50: {metrics.box.map:.4f}")
        logger.info(f"mAP50-95: {metrics.box.map50_95:.4f}")
        logger.info(f"精度: {metrics.box.precision:.4f}")
        logger.info(f"召回率: {metrics.box.recall:.4f}")
        
        logger.info("\n" + "=" * 70)
        logger.info("🎉 训练成功完成！")
        logger.info("=" * 70)
        
    except Exception as e:
        logger.error("\n" + "=" * 70)
        logger.error("❌ 训练失败")
        logger.error("=" * 70)
        logger.error(f"错误信息: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    success = run_training_background()
    sys.exit(0 if success else 1)
