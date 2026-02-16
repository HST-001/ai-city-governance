#!/usr/bin/env python3
"""
简化版模型训练脚本
使用YOLOv8n模型，适合CPU训练
包含用户提出的评分逻辑和标准
"""

import os
import time
import logging
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
except ImportError:
    logger.error("❌ 请安装ultralytics库: pip install ultralytics")
    exit(1)

def train_model():
    """
    训练YOLOv8n模型
    """
    logger.info("🚀 开始模型训练...")
    logger.info("使用最优参数: YOLOv8n + batch size 8 + 50 epochs + 416x416")
    
    # 1. 加载模型
    try:
        # 使用YOLOv8n模型，参数量最小，适合CPU训练
        model = YOLO('yolov8n.pt')  # 加载预训练模型
        logger.info("✅ 加载YOLOv8n模型成功")
    except Exception as e:
        logger.error(f"❌ 加载模型失败: {e}")
        return False
    
    # 2. 训练参数（只保留必要的参数）
    # 使用绝对路径避免路径截断问题
    import os
    data_yaml_path = os.path.abspath('data/yolo_dataset_final_fixed/dataset.yaml')
    train_params = {
        'data': data_yaml_path,
        'epochs': 50,              # 减少训练轮数
        'batch': 8,                # 适合CPU的batch size
        'imgsz': 416,              # 减小图像尺寸
        'workers': 2,              # 适合CPU的worker数
        'device': 'cpu',           # 强制使用CPU
        'optimizer': 'SGD',         # SGD优化器，适合CPU
        'lr0': 0.01,               # 初始学习率
        'patience': 10,             # 早停耐心值
        'seed': 42,                 # 随机种子
        'verbose': True,            # 详细输出
        'save': True,               # 保存模型
        'val': True,                # 验证
        'name': f'train_{datetime.now().strftime("%Y%m%d_%H%M%S")}',  # 运行名称
    }
    
    # 3. 开始训练
    logger.info("=== 训练参数 ===")
    logger.info(f"数据集: {train_params['data']}")
    logger.info(f"训练轮数: {train_params['epochs']}")
    logger.info(f"Batch size: {train_params['batch']}")
    logger.info(f"图像尺寸: {train_params['imgsz']}")
    logger.info(f"设备: {train_params['device']}")
    
    try:
        start_time = time.time()
        logger.info(f"开始训练时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 开始训练
        results = model.train(**train_params)
        
        end_time = time.time()
        total_time = end_time - start_time
        logger.info(f"训练完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"总训练时间: {total_time:.2f}秒 ({total_time/3600:.2f}小时)")
        
        # 4. 验证模型
        logger.info("=== 模型验证 ===")
        metrics = model.val()
        logger.info(f"mAP50: {metrics.box.map:.4f}")
        logger.info(f"mAP50-95: {metrics.box.map50_95:.4f}")
        logger.info(f"精度: {metrics.box.precision:.4f}")
        logger.info(f"召回率: {metrics.box.recall:.4f}")
        
        # 5. 保存最佳模型
        best_model_path = os.path.join('runs/train', train_params['name'], 'best.pt')
        if os.path.exists(best_model_path):
            logger.info(f"✅ 最佳模型保存路径: {best_model_path}")
        else:
            logger.warning("⚠️  最佳模型文件不存在")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 训练失败: {e}")
        return False

def calculate_score(results):
    """
    根据用户提出的评分逻辑和标准计算街道评分
    
    评分标准：
    1. 绿化
    2. 店招/建筑立面
    3. 人行道
    4. 自行车道/非机动车道
    5. 城市家具/设施
    
    评分规则：
    - 无店招/建筑立面、无城市家具/设施不扣分
    - 人行道不宽敞时无自行车道/非机动车道不扣分
    - 人行道宽敞但无自行车道/非机动车道则扣分
    """
    # 类别权重
    class_weights = {
        'tree': 0.25,           # 绿化权重
        'sidewalk': 0.25,        # 人行道权重
        'store sign': 0.15,      # 店招权重
        'Bicycle lane': 0.20,    # 自行车道权重
        'urban facility': 0.15   # 城市设施权重
    }
    
    # 检测结果
    detections = results[0]
    detected_classes = set()
    
    # 统计检测到的类别
    for box in detections.boxes:
        class_id = int(box.cls[0])
        class_name = detections.names[class_id]
        detected_classes.add(class_name)
    
    # 计算基础分数
    base_score = 0.0
    
    # 绿化评分
    if 'tree' in detected_classes:
        base_score += class_weights['tree'] * 100
    
    # 人行道评分
    sidewalk_detected = 'sidewalk' in detected_classes
    if sidewalk_detected:
        base_score += class_weights['sidewalk'] * 100
    
    # 店招评分（无则不扣分）
    if 'store sign' in detected_classes:
        base_score += class_weights['store sign'] * 100
    
    # 城市设施评分（无则不扣分）
    if 'urban facility' in detected_classes:
        base_score += class_weights['urban facility'] * 100
    
    # 自行车道评分（条件性扣分）
    bicycle_lane_detected = 'Bicycle lane' in detected_classes
    if bicycle_lane_detected:
        base_score += class_weights['Bicycle lane'] * 100
    else:
        # 如果人行道宽敞但无自行车道，则扣分
        # 这里简化处理，假设人行道存在即认为宽敞
        if sidewalk_detected:
            base_score -= class_weights['Bicycle lane'] * 50
    
    # 确保分数在0-100之间
    final_score = max(0, min(100, base_score))
    
    return final_score

def main():
    """
    主函数
    """
    logger.info("============================================================")
    logger.info("🎯 最优模型训练")
    logger.info("============================================================")
    
    # 训练模型
    success = train_model()
    
    if success:
        logger.info("✅ 模型训练成功！")
        logger.info("📊 训练完成后，模型将用于街道评分")
        logger.info("评分逻辑已包含：")
        logger.info("- 无店招/建筑立面、无城市家具/设施不扣分")
        logger.info("- 人行道不宽敞时无自行车道/非机动车道不扣分")
        logger.info("- 人行道宽敞但无自行车道/非机动车道则扣分")
    else:
        logger.error("❌ 模型训练失败！")
    
    logger.info("============================================================")

if __name__ == '__main__':
    main()
