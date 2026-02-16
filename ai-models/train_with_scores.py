#!/usr/bin/env python3
"""
使用包含评分信息的数据集训练YOLOv8 + 回归头模型
"""

import os
import sys
import json
import torch
import torch.nn as nn
from datetime import datetime
from ultralytics import YOLO

# 数据集路径
DATASET_YAML = 'data/yolo_dataset_complete_with_scores/dataset.yaml'
SCORES_FILE = 'data/yolo_dataset_complete_with_scores/scores.json'

# 训练参数
EPOCHS = 50
BATCH = 4
IMGSZ = 416
DEVICE = 'cpu'

# 断点续训配置
RESUME_TRAINING = True
LAST_CHECKPOINT = None

# 预训练模型路径
PRETRAINED_MODEL = '../models/model_100.pt'

class YOLOv8WithRegression(YOLO):
    """
    带有回归头的YOLOv8模型
    用于同时进行目标检测和质量评分
    """
    
    def __init__(self, model='yolov8n.pt', task=None, verbose=False):
        super().__init__(model=model, task=task, verbose=verbose)
        self.add_regression_head()
        self.freeze_detection_layers()
        self.scores_data = self.load_scores()
    
    def add_regression_head(self):
        """
        添加回归头用于质量评分
        """
        # 检查是否已经添加了回归头
        if hasattr(self.model.model, 'regression_head'):
            return
        
        # 创建回归头
        # 对于YOLOv8n，最后一个特征图的通道数是256
        regression_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.SiLU(),
            nn.Linear(128, 64),
            nn.SiLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()  # 输出0-1，后续乘以100得到0-100分
        )
        
        # 将回归头添加到模型
        self.model.model.regression_head = regression_head
        
        print("✅ 回归头添加成功")
    
    def freeze_detection_layers(self):
        """
        冻结检测层参数，只训练回归头
        """
        # 冻结所有检测层参数
        for param in self.model.model.parameters():
            param.requires_grad = False
        
        # 只解冻回归头参数
        if hasattr(self.model.model, 'regression_head'):
            for param in self.model.model.regression_head.parameters():
                param.requires_grad = True
        
        print("✅ 检测层已冻结，只训练回归头")
    
    def load_scores(self):
        """
        加载评分数据
        """
        if os.path.exists(SCORES_FILE):
            with open(SCORES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def get_score_for_image(self, image_path):
        """
        获取图片的评分
        """
        image_name = os.path.basename(image_path)
        
        # 检查所有项目的评分数据
        for project_key in self.scores_data:
            if image_name in self.scores_data[project_key]:
                return self.scores_data[project_key][image_name]['avg_score']
        
        return 50  # 默认中等分数

def train_model():
    """
    训练YOLOv8 + 回归头模型
    """
    print("=" * 70)
    print("🚀 YOLOv8 + 回归头训练系统（使用评分数据）")
    print("=" * 70)
    print()
    print(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # 检查数据集
    if not os.path.exists(DATASET_YAML):
        print(f"❌ 数据集配置文件不存在: {DATASET_YAML}")
        return

    if not os.path.exists(SCORES_FILE):
        print(f"❌ 评分文件不存在: {SCORES_FILE}")
        return

    print("📋 训练参数:")
    print(f"  数据集: {DATASET_YAML}")
    print(f"  训练轮数: {EPOCHS}")
    print(f"  批次大小: {BATCH}")
    print(f"  图像尺寸: {IMGSZ}")
    print(f"  设备: {DEVICE}")
    print(f"  优化器: SGD")
    print(f"  学习率: 0.01")
    print(f"  早停耐心值: 10")
    print(f"  每个epoch保存: 是")
    print()

    try:
        # 查找最近的检查点
        def find_latest_checkpoint():
            """
            查找最近的训练检查点
            """
            import glob
            checkpoint_patterns = [
                'runs/detect/*/weights/last.pt',
                'runs/detect/*/weights/best.pt'
            ]
            
            latest_checkpoint = None
            latest_time = 0
            
            for pattern in checkpoint_patterns:
                checkpoints = glob.glob(pattern)
                for checkpoint in checkpoints:
                    mod_time = os.path.getmtime(checkpoint)
                    if mod_time > latest_time:
                        latest_time = mod_time
                        latest_checkpoint = checkpoint
            
            return latest_checkpoint
        
        # 加载模型
        if RESUME_TRAINING:
            latest_checkpoint = find_latest_checkpoint()
            if latest_checkpoint:
                print(f"从断点恢复训练: {latest_checkpoint}")
                model = YOLOv8WithRegression(latest_checkpoint)
                print("✅ 从检查点恢复成功")
            else:
                print("未找到检查点，使用预训练模型开始训练...")
                model = YOLOv8WithRegression(PRETRAINED_MODEL)
                print("✅ 模型加载成功")
        else:
            print("使用预训练模型开始训练...")
            model = YOLOv8WithRegression(PRETRAINED_MODEL)
            print("✅ 模型加载成功")
        print()

        # 训练参数
        train_params = {
            'data': DATASET_YAML,
            'epochs': EPOCHS,
            'batch': BATCH,
            'imgsz': IMGSZ,
            'workers': 2,
            'device': DEVICE,
            'optimizer': 'SGD',
            'lr0': 0.01,
            'patience': 10,
            'seed': 42,
            'verbose': True,
            'save': True,
            'val': True,
            'save_period': 1,
            'name': f'yolov8n_with_scores_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'resume': False,  # 禁用自动resume，使用我们自己的断点续训逻辑
        }

        # 开始训练
        print("开始训练...")
        print("=" * 70)
        print()

        # 训练模型
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
        
        # 保存带有回归头的模型
        print("保存带有回归头的完整模型...")
        final_model_path = os.path.join('models', f'yolov8n_with_scores_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pt')
        os.makedirs('models', exist_ok=True)
        
        # 保存最佳模型到主models目录
        best_model_path = os.path.join('..', 'models', 'yolov8n_with_scores_best.pt')
        if os.path.exists('runs/detect'):
            # 查找最新的最佳模型
            import glob
            best_models = glob.glob('runs/detect/*/weights/best.pt')
            if best_models:
                latest_best = max(best_models, key=os.path.getmtime)
                import shutil
                shutil.copy2(latest_best, best_model_path)
                print(f"✅ 最佳模型已复制到: {best_model_path}")
        
        print(f"✅ 完整模型训练完成")
        print()

    except KeyboardInterrupt:
        print()
        print("=" * 70)
        print("⚠️  训练被用户中断")
        print("=" * 70)
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
    print("脚本启动")
    print(f"当前工作目录: {os.getcwd()}")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"脚本目录: {script_dir}")
    os.chdir(script_dir)
    print(f"切换后工作目录: {os.getcwd()}")
    train_model()
