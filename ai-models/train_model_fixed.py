#!/usr/bin/env python3
"""
模型训练脚本（修复版）
使用修复后的数据集重新训练YOLOv8模型
"""

import os
import sys
from ultralytics import YOLO
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def train_model():
    """训练YOLOv8模型"""
    print("🚀 开始模型训练...")
    print("=" * 60)
    
    # 数据集配置
    data_config = 'data/yolo_dataset_final_fixed/dataset.yaml'
    
    # 检查配置文件是否存在
    if not os.path.exists(data_config):
        logger.error(f"数据集配置文件不存在: {data_config}")
        return False
    
    logger.info(f"使用数据集配置: {data_config}")
    
    # 选择模型架构
    # 使用YOLOv8s（比v8n更大的模型）以获得更好的性能
    model = YOLO('yolov8s.pt')
    logger.info("使用模型: YOLOv8s")
    
    # 训练参数
    try:
        logger.info("开始训练...")
        
        # 训练模型
        results = model.train(
            data=data_config,
            epochs=100,              # 增加训练轮数
            batch=8,                  # 批量大小
            imgsz=640,                # 输入图像大小
            device='cpu',             # 使用CPU训练
            patience=20,              # 早停patience
            class_weights=[1.0, 3.0, 2.0, 5.0, 1.0],  # 平衡类别权重
            name='yolov8s_training_fixed',  # 训练结果保存目录
            augment=True,             # 启用数据增强
            mosaic=1.0,               # 马赛克增强
            mixup=0.2,                # 混合增强
            copy_paste=0.1,            # 复制粘贴增强
            degrees=10.0,              # 旋转角度
            translate=0.1,             # 平移
            scale=0.1,                 # 缩放
            flipud=0.0,                # 上下翻转
            fliplr=0.5,                # 左右翻转
            hsv_h=0.015,               # HSV色调调整
            hsv_s=0.7,                 # HSV饱和度调整
            hsv_v=0.4                  # HSV亮度调整
        )
        
        logger.info("训练完成！")
        
        # 验证模型
        logger.info("开始验证模型...")
        val_results = model.val()
        
        # 打印验证结果
        print("\n=== 模型验证结果 ===")
        print(f"mAP50: {val_results.box.map:.4f}")
        print(f"mAP50-95: {val_results.box.map50:.4f}")
        print(f"Precision: {val_results.box.precision:.4f}")
        print(f"Recall: {val_results.box.recall:.4f}")
        
        # 打印类别性能
        print("\n=== 类别性能 ===")
        for i, (name, ap50) in enumerate(zip(val_results.names.values(), val_results.box.map50)):
            print(f"{name}: mAP50={ap50:.4f}")
        
        # 保存最佳模型路径
        best_model_path = os.path.join('runs', 'detect', 'yolov8s_training_fixed', 'weights', 'best.pt')
        if os.path.exists(best_model_path):
            logger.info(f"最佳模型已保存: {best_model_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"训练过程中出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    success = train_model()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ 模型训练成功完成！")
        print("=" * 60)
        print("下一步:")
        print("1. 更新Flask API中的模型路径")
        print("2. 优化评分逻辑")
        print("3. 测试模型性能")
    else:
        print("\n" + "=" * 60)
        print("❌ 模型训练失败！")
        print("=" * 60)

if __name__ == '__main__':
    main()
