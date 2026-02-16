#!/usr/bin/env python3
"""
增强版模型训练脚本
包含检查点保存、恢复机制和详细的调试输出
"""

import os
import sys
import time
import logging
from datetime import datetime
import glob

# 设置日志 - 确保实时输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)

# 确保日志立即输出
for handler in logger.handlers:
    handler.flush = lambda: None

try:
    from ultralytics import YOLO
except ImportError:
    logger.error("❌ 请安装ultralytics库: pip install ultralytics")
    sys.exit(1)

def find_latest_checkpoint():
    """查找最新的检查点文件"""
    try:
        runs_dir = 'runs/train'
        if not os.path.exists(runs_dir):
            logger.info("📂 未找到训练运行目录")
            return None
        
        # 查找所有训练运行
        train_runs = [d for d in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, d))]
        
        if not train_runs:
            logger.info("📂 未找到任何训练运行")
            return None
        
        # 按修改时间排序，获取最新的
        train_runs.sort(key=lambda x: os.path.getmtime(os.path.join(runs_dir, x)), reverse=True)
        latest_run = train_runs[0]
        
        # 查找该运行中的所有.pt文件
        run_dir = os.path.join(runs_dir, latest_run)
        pt_files = glob.glob(os.path.join(run_dir, '*.pt'))
        
        if not pt_files:
            logger.info(f"📂 在 {latest_run} 中未找到检查点文件")
            return None
        
        # 按修改时间排序，获取最新的检查点
        pt_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        latest_checkpoint = pt_files[0]
        
        # 获取检查点信息
        checkpoint_time = datetime.fromtimestamp(os.path.getmtime(latest_checkpoint))
        checkpoint_size = os.path.getsize(latest_checkpoint) / (1024 * 1024)  # MB
        
        logger.info(f"✅ 找到最新检查点: {os.path.basename(latest_checkpoint)}")
        logger.info(f"   时间: {checkpoint_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"   大小: {checkpoint_size:.2f} MB")
        
        return latest_checkpoint
        
    except Exception as e:
        logger.warning(f"⚠️  查找检查点时出错: {e}")
        return None

def verify_dataset(data_yaml_path):
    """验证数据集配置"""
    logger.info("🔍 验证数据集配置...")
    
    if not os.path.exists(data_yaml_path):
        logger.error(f"❌ 数据集配置文件不存在: {data_yaml_path}")
        return False
    
    logger.info(f"✅ 数据集配置文件存在: {data_yaml_path}")
    
    # 读取配置文件
    try:
        with open(data_yaml_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        logger.info("📄 数据集配置内容:")
        for line in lines:
            logger.info(f"   {line.rstrip()}")
        
        # 检查路径
        dataset_dir = os.path.dirname(data_yaml_path)
        logger.info(f"\n📂 数据集目录: {dataset_dir}")
        
        # 检查train目录
        train_images = os.path.join(dataset_dir, 'train', 'images')
        train_labels = os.path.join(dataset_dir, 'train', 'labels')
        
        if os.path.exists(train_images):
            train_img_count = len([f for f in os.listdir(train_images) if f.endswith(('.jpg', '.jpeg', '.png'))])
            logger.info(f"✅ 训练集图像: {train_img_count} 张")
        else:
            logger.error(f"❌ 训练集图像目录不存在: {train_images}")
            return False
        
        if os.path.exists(train_labels):
            train_lbl_count = len([f for f in os.listdir(train_labels) if f.endswith('.txt')])
            logger.info(f"✅ 训练集标签: {train_lbl_count} 个")
        else:
            logger.error(f"❌ 训练集标签目录不存在: {train_labels}")
            return False
        
        # 检查val目录
        val_images = os.path.join(dataset_dir, 'val', 'images')
        val_labels = os.path.join(dataset_dir, 'val', 'labels')
        
        if os.path.exists(val_images):
            val_img_count = len([f for f in os.listdir(val_images) if f.endswith(('.jpg', '.jpeg', '.png'))])
            logger.info(f"✅ 验证集图像: {val_img_count} 张")
        else:
            logger.error(f"❌ 验证集图像目录不存在: {val_images}")
            return False
        
        if os.path.exists(val_labels):
            val_lbl_count = len([f for f in os.listdir(val_labels) if f.endswith('.txt')])
            logger.info(f"✅ 验证集标签: {val_lbl_count} 个")
        else:
            logger.error(f"❌ 验证集标签目录不存在: {val_labels}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 读取数据集配置失败: {e}")
        return False

def train_model():
    """
    训练YOLOv8n模型，支持检查点恢复
    """
    logger.info("=" * 70)
    logger.info("🚀 开始模型训练...")
    logger.info("=" * 70)
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    logger.info(f"工作目录: {os.getcwd()}")
    
    # 1. 查找最新的检查点
    checkpoint_path = find_latest_checkpoint()
    
    # 2. 加载模型
    try:
        if checkpoint_path:
            logger.info(f"📂 从检查点加载模型: {checkpoint_path}")
            model = YOLO(checkpoint_path)
            logger.info("✅ 从检查点加载模型成功")
        else:
            logger.info("📂 加载预训练模型: yolov8n.pt")
            model = YOLO('yolov8n.pt')
            logger.info("✅ 加载预训练模型成功")
    except Exception as e:
        logger.error(f"❌ 加载模型失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 3. 验证数据集
    # 使用相对路径，从ai-models目录开始
    data_yaml_path = 'data/yolo_dataset_final_fixed/dataset.yaml'
    if not verify_dataset(data_yaml_path):
        logger.error("❌ 数据集验证失败")
        return False
    
    # 4. 训练参数
    train_params = {
        'data': data_yaml_path,
        'epochs': 50,
        'batch': 8,
        'imgsz': 416,
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
        'resume': checkpoint_path is not None,  # 如果有检查点则恢复训练
        'name': f'train_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
    }
    
    # 5. 显示训练参数
    logger.info("\n" + "=" * 70)
    logger.info("📋 训练参数")
    logger.info("=" * 70)
    for key, value in train_params.items():
        logger.info(f"   {key}: {value}")
    
    logger.info("\n" + "=" * 70)
    logger.info("🎯 开始训练")
    logger.info("=" * 70)
    
    # 6. 开始训练
    try:
        start_time = time.time()
        logger.info(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("")
        
        # 强制刷新日志
        sys.stdout.flush()
        
        # 开始训练
        results = model.train(**train_params)
        
        end_time = time.time()
        total_time = end_time - start_time
        logger.info("")
        logger.info("=" * 70)
        logger.info("✅ 训练完成")
        logger.info("=" * 70)
        logger.info(f"⏰ 完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"⏱️  总耗时: {total_time:.2f}秒 ({total_time/3600:.2f}小时)")
        
        # 7. 验证模型
        logger.info("\n" + "=" * 70)
        logger.info("📊 模型验证")
        logger.info("=" * 70)
        metrics = model.val()
        logger.info(f"   mAP50: {metrics.box.map:.4f}")
        logger.info(f"   mAP50-95: {metrics.box.map50_95:.4f}")
        logger.info(f"   精度: {metrics.box.precision:.4f}")
        logger.info(f"   召回率: {metrics.box.recall:.4f}")
        
        # 8. 显示模型保存位置
        logger.info("\n" + "=" * 70)
        logger.info("💾 模型文件")
        logger.info("=" * 70)
        runs_dir = 'runs/train'
        train_runs = [d for d in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, d))]
        if train_runs:
            train_runs.sort(key=lambda x: os.path.getmtime(os.path.join(runs_dir, x)), reverse=True)
            latest_run = train_runs[0]
            run_dir = os.path.join(runs_dir, latest_run)
            
            best_model = os.path.join(run_dir, 'best.pt')
            last_model = os.path.join(run_dir, 'last.pt')
            
            if os.path.exists(best_model):
                logger.info(f"✅ 最佳模型: {best_model}")
            if os.path.exists(last_model):
                logger.info(f"✅ 最新模型: {last_model}")
        
        return True
        
    except Exception as e:
        logger.error("")
        logger.error("=" * 70)
        logger.error("❌ 训练失败")
        logger.error("=" * 70)
        logger.error(f"错误信息: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """
    主函数
    """
    print("\n" + "=" * 70)
    print("🎯 YOLOv8n 增强训练系统")
    print("=" * 70)
    print("功能特性:")
    print("  ✓ 自动检测和恢复训练检查点")
    print("  ✓ 每个epoch自动保存检查点")
    print("  ✓ 详细的调试输出")
    print("  ✓ 实时训练进度显示")
    print("=" * 70)
    print()
    
    # 训练模型
    success = train_model()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ 模型训练成功！")
    else:
        print("❌ 模型训练失败！")
    print("=" * 70)
    print()

if __name__ == '__main__':
    main()
