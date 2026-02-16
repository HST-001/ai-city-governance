#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
YOLOv8训练脚本 - 用于训练街道元素检测模型
"""

import os
import logging
import sys
from pathlib import Path
from ultralytics import YOLO
import yaml

# 确保输出不被缓冲
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# 配置日志 - 同时输出到文件和终端
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('training.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)


class YOLOv8Trainer:
    """YOLOv8训练器"""
    
    def __init__(self, model_size='n', data_yaml_path=None):
        """
        初始化训练器
        
        Args:
            model_size: 模型大小（n/s/m/l/x）
            data_yaml_path: 数据集配置文件路径
        """
        self.model_size = model_size
        self.data_yaml_path = data_yaml_path
        
        # 模型配置
        self.model_config = {
            'n': 'yolov8n.pt',  # nano
            's': 'yolov8s.pt',  # small
            'm': 'yolov8m.pt',  # medium
            'l': 'yolov8l.pt',  # large
            'x': 'yolov8x.pt'   # extra large
        }
        
        # 训练配置
        self.train_config = {
            'epochs': 100,
            'batch': 16,
            'imgsz': 640,
            'optimizer': 'AdamW',
            'lr0': 0.0001,
            'lrf': 0.01,
            'momentum': 0.937,
            'weight_decay': 0.0005,
            'warmup_epochs': 3,
            'warmup_momentum': 0.8,
            'warmup_bias_lr': 0.1,
            'box': 7.5,
            'cls': 0.5,
            'dfl': 1.5,
            'mosaic': 1.0,
            'mixup': 0.0,
            'copy_paste': 0.0,
            'device': 'cpu',  # 默认使用CPU，避免CUDA错误
            'workers': 8,
            'project': 'street_elements',
            'name': f'yolov8{model_size}_training',
            'exist_ok': True,
            'pretrained': True,
            'verbose': True,
            'seed': 42,
            'deterministic': True,
            'single_cls': False,
            'rect': False,
            'cos_lr': False,
            'close_mosaic': 10,
            'resume': False,
            'amp': True,
            'fraction': 1.0,
            'profile': False,
            'freeze': None,
            'multi_scale': False,
            'overlap_mask': True,
            'mask_ratio': 4,
            'dropout': 0.0,
            'val': True,
            'plots': True,
            'save': True,
            'save_json': False,
            'save_hybrid': False,
            'conf': None,
            'iou': 0.7,
            'max_det': 300,
            'half': False,
            'dnn': False,
            'plots': True,
            'show': False,
            'save_txt': False,
            'save_conf': False,
            'save_crop': False,
            'show_labels': True,
            'show_conf': True,
            'visualize': False,
            'augment': False,
            'agnostic_nms': False,
            'classes': None,
            'retina_masks': False,
            'boxes': True,
            'verbose': True  # 确保详细输出
        }
        
        # 加载模型
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """加载YOLOv8模型"""
        try:
            model_path = self.model_config.get(self.model_size, 'yolov8n.pt')
            logger.info(f"加载YOLOv8模型: {model_path}")
            self.model = YOLO(model_path)
            logger.info("YOLOv8模型加载成功")
        except Exception as e:
            logger.error(f"YOLOv8模型加载失败: {e}")
            raise
    
    def prepare_data(self, data_yaml_path=None):
        """
        准备数据集
        
        Args:
            data_yaml_path: 数据集配置文件路径
        """
        if data_yaml_path:
            self.data_yaml_path = data_yaml_path
        
        if not self.data_yaml_path:
            # 使用默认数据集路径
            self.data_yaml_path = 'data/yolo_dataset/dataset.yaml'
        
        # 检查数据集配置文件是否存在
        if not os.path.exists(self.data_yaml_path):
            logger.error(f"数据集配置文件不存在: {self.data_yaml_path}")
            raise FileNotFoundError(f"数据集配置文件不存在: {self.data_yaml_path}")
        
        logger.info(f"使用数据集配置文件: {self.data_yaml_path}")
        
        # 读取并验证数据集配置
        with open(self.data_yaml_path, 'r', encoding='utf-8') as f:
            data_config = yaml.safe_load(f)
        
        logger.info(f"数据集信息:")
        logger.info(f"  路径: {data_config.get('path')}")
        logger.info(f"  训练集: {data_config.get('train')}")
        logger.info(f"  验证集: {data_config.get('val')}")
        logger.info(f"  类别数量: {data_config.get('nc')}")
        logger.info(f"  类别名称: {data_config.get('names')}")
    
    def train(self, data_yaml_path=None, **kwargs):
        """
        训练模型
        
        Args:
            data_yaml_path: 数据集配置文件路径
            **kwargs: 其他训练参数
            
        Returns:
            dict: 训练结果
        """
        # 准备数据集
        self.prepare_data(data_yaml_path)
        
        # 更新训练配置
        for key, value in kwargs.items():
            if key in self.train_config:
                self.train_config[key] = value
                logger.info(f"更新训练配置: {key} = {value}")
        
        # 开始训练
        logger.info("开始训练YOLOv8模型")
        logger.info(f"训练配置: {self.train_config}")
        
        # 强制刷新输出缓冲区
        sys.stdout.flush()
        sys.stderr.flush()
        
        try:
            # 执行训练 - 确保verbose参数生效
            print("\n" + "="*60)
            print("YOLOv8训练开始...")
            print("="*60 + "\n")
            sys.stdout.flush()
            
            results = self.model.train(
                data=self.data_yaml_path,
                **self.train_config
            )
            
            print("\n" + "="*60)
            print("训练完成")
            print("="*60 + "\n")
            sys.stdout.flush()
            
            logger.info("训练完成")
            return results
        except Exception as e:
            logger.error(f"训练失败: {e}")
            raise
    
    def validate(self, data_yaml_path=None, **kwargs):
        """
        验证模型
        
        Args:
            data_yaml_path: 数据集配置文件路径
            **kwargs: 其他验证参数
            
        Returns:
            dict: 验证结果
        """
        if not self.model:
            logger.error("模型未加载，无法验证")
            return None
        
        if data_yaml_path:
            self.data_yaml_path = data_yaml_path
        
        logger.info("开始验证模型")
        
        try:
            # 执行验证
            results = self.model.val(
                data=self.data_yaml_path,
                **kwargs
            )
            
            logger.info("验证完成")
            return results
        except Exception as e:
            logger.error(f"验证失败: {e}")
            return None
    
    def export_model(self, format='onnx'):
        """
        导出模型
        
        Args:
            format: 导出格式（onnx, torchscript, coreml, tflite等）
        """
        if not self.model:
            logger.error("模型未加载，无法导出")
            return
        
        logger.info(f"导出模型为{format}格式")
        
        try:
            # 导出模型
            self.model.export(format=format)
            logger.info(f"模型导出成功: {format}")
        except Exception as e:
            logger.error(f"模型导出失败: {e}")
    
    def get_model_info(self):
        """
        获取模型信息
        
        Returns:
            dict: 模型信息
        """
        if not self.model:
            return {}
        
        return {
            'model_size': self.model_size,
            'model_path': self.model_config.get(self.model_size),
            'data_yaml_path': self.data_yaml_path,
            'train_config': self.train_config
        }


def main():
    """主函数"""
    import argparse
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='YOLOv8训练脚本')
    parser.add_argument('--model-size', type=str, default='n', choices=['n', 's', 'm', 'l', 'x'],
                        help='模型大小（n/s/m/l/x）')
    parser.add_argument('--epochs', type=int, default=100,
                        help='训练轮数')
    parser.add_argument('--batch', type=int, default=16,
                        help='批次大小')
    parser.add_argument('--imgsz', type=int, default=640,
                        help='图像大小')
    parser.add_argument('--device', type=str, default='cpu',
                        help='训练设备（cpu或0,1,2...）')
    parser.add_argument('--data', type=str, default='data/yolo_dataset_final_fixed/dataset.yaml',
                        help='数据集配置文件路径')
    parser.add_argument('--resume', type=bool, default=False,
                        help='是否从上次中断处继续训练')
    parser.add_argument('--save-period', type=int, default=1,
                        help='每多少个epoch保存一次检查点')
    
    args = parser.parse_args()
    
    # 创建训练器
    trainer = YOLOv8Trainer(model_size=args.model_size)
    
    # 获取模型信息
    model_info = trainer.get_model_info()
    logger.info(f"模型信息: {model_info}")
    
    # 训练模型
    try:
        # 设置训练参数
        train_params = {
            'epochs': args.epochs,
            'batch': args.batch,
            'imgsz': args.imgsz,
            'device': args.device,
            'resume': args.resume,
            'save_period': args.save_period
        }
        
        logger.info(f"训练参数: {train_params}")
        
        results = trainer.train(
            data_yaml_path=args.data,
            **train_params
        )
        
        logger.info("训练成功完成")
        
        # 验证模型
        try:
            val_results = trainer.validate(data_yaml_path=args.data)
            if val_results:
                logger.info(f"验证结果: {val_results}")
        except Exception as val_error:
            logger.warning(f"验证过程出错: {val_error}")
        
        # 导出模型
        try:
            trainer.export_model(format='onnx')
        except Exception as export_error:
            logger.warning(f"模型导出出错: {export_error}")
        
    except KeyboardInterrupt:
        logger.info("训练被用户中断")
        logger.info("已保存的检查点可用于后续继续训练")
    except Exception as e:
        logger.error(f"训练失败: {e}")
        import traceback
        traceback.print_exc()
        logger.info("已保存的检查点可用于后续继续训练")


if __name__ == '__main__':
    main()
