#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
模型训练服务API
用于接收Spring Boot的训练请求并执行模型训练
"""

import os
import sys
import json
import time
import threading
import logging
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 训练是否可用（使用真实训练）
TRAINING_AVAILABLE = True

# 创建Flask应用
app = Flask(__name__)
CORS(app)

# 配置
# 获取项目根目录
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(PROJECT_ROOT, 'backend/uploads/training-datasets')
MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')
PROGRESS_DIR = os.path.join(MODELS_DIR, 'progress')

# 打印路径信息，便于调试
logger.info(f"项目根目录: {PROJECT_ROOT}")
logger.info(f"数据集目录: {DATASETS_DIR}")
logger.info(f"模型目录: {MODELS_DIR}")
logger.info(f"进度目录: {PROGRESS_DIR}")

# 确保目录存在
for dir_path in [MODELS_DIR, PROGRESS_DIR]:
    os.makedirs(dir_path, exist_ok=True)
    logger.info(f"确保目录存在: {dir_path}")

# 存储训练任务
training_tasks = {}

# 存储数据集ID到路径的映射
dataset_id_to_path = {}

def get_dataset_path(dataset_id):
    """根据数据集ID获取数据集路径"""
    # 如果已经缓存，直接返回
    if dataset_id in dataset_id_to_path:
        return dataset_id_to_path[dataset_id]
    
    # 遍历所有数据集目录，找到匹配ID的
    if not os.path.exists(DATASETS_DIR):
        return None
    
    for dataset_name in os.listdir(DATASETS_DIR):
        dataset_path = os.path.join(DATASETS_DIR, dataset_name)
        if os.path.isdir(dataset_path):
            # 尝试从目录名中提取ID（如果有的话）
            # 或者使用其他方式匹配
            # 这里简化处理：直接返回第一个找到的数据集
            # 实际应该从数据库查询
            pass
    
    # 暂时返回None，让调用者处理
    return None

class TrainingTask:
    """训练任务类"""
    def __init__(self, task_id, dataset_path, model_type, epochs=10):
        self.task_id = task_id
        self.dataset_path = dataset_path
        self.model_type = model_type
        self.epochs = epochs
        self.status = 'pending'
        self.progress = 0
        self.accuracy = 0.0
        self.model_path = None
        self.error = None
        self.start_time = None
        self.end_time = None
        self.thread = None

    def save_progress(self):
        """保存训练进度到文件"""
        progress_file = os.path.join(PROGRESS_DIR, f"progress_{self.task_id}.json")
        progress_data = {
            'task_id': self.task_id,
            'status': self.status,
            'progress': self.progress,
            'accuracy': self.accuracy,
            'model_path': self.model_path,
            'error': self.error,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'timestamp': datetime.now().isoformat()
        }
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, ensure_ascii=False, indent=2)

    def run_training(self):
        """执行训练任务"""
        try:
            self.status = 'training'
            self.start_time = datetime.now()
            self.save_progress()
            
            logger.info(f"开始训练任务 {self.task_id}")
            logger.info(f"数据集路径: {self.dataset_path}")
            logger.info(f"模型类型: {self.model_type}")
            logger.info(f"训练轮数: {self.epochs}")
            
            if TRAINING_AVAILABLE:
                # 使用真实训练
                self._run_real_training()
            else:
                # 使用模拟训练
                self._run_mock_training()
            
            # 训练完成
            self.status = 'completed'
            self.progress = 100
            self.end_time = datetime.now()
            self.save_progress()
            
            logger.info(f"任务 {self.task_id} 训练完成 - 准确率: {self.accuracy:.2f}%")
            
        except Exception as e:
            logger.error(f"训练任务 {self.task_id} 失败: {e}")
            self.status = 'failed'
            self.error = str(e)
            self.end_time = datetime.now()
            self.save_progress()
    
    def _run_real_training(self):
        """执行真实的训练"""
        try:
            # 导入训练模块
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scripts'))
            from train_model import ModelTrainer
            
            # 创建训练器
            trainer = ModelTrainer()
            
            # 修改训练轮数
            trainer.config = {
                'epochs': self.epochs,
                'batch_size': 8,
                'learning_rate': 0.0001
            }
            
            # 执行训练
            for epoch in range(self.epochs):
                # 训练一个epoch
                train_loss, train_acc = trainer.train_one_epoch(epoch)
                
                # 在验证集上评估
                val_loss, val_acc = trainer.validate()
                
                # 更新进度
                progress = ((epoch + 1) / self.epochs) * 100
                self.progress = int(progress)
                self.accuracy = val_acc * 100
                
                logger.info(f"任务 {self.task_id} - Epoch {epoch+1}/{self.epochs} - 进度: {self.progress:.1f}% - 验证准确率: {self.accuracy:.2f}%")
                self.save_progress()
            
            # 保存模型
            self.model_path = os.path.join(MODELS_DIR, f"model_{self.task_id}.pth")
            # 实际保存模型
            if hasattr(trainer, 'model'):
                import torch
                torch.save(trainer.model.state_dict(), self.model_path)
                logger.info(f"模型已保存到: {self.model_path}")
            else:
                logger.warning("训练器没有 model 属性，无法保存模型")
            
        except Exception as e:
            logger.error(f"真实训练失败: {e}")
            raise
    
    def _run_mock_training(self):
        """执行模拟训练"""
        for epoch in range(self.epochs):
            time.sleep(2)
            
            progress = ((epoch + 1) / self.epochs) * 100
            self.progress = int(progress)
            self.accuracy = 70.0 + random.random() * 20.0
            
            logger.info(f"任务 {self.task_id} - Epoch {epoch+1}/{self.epochs} - 进度: {self.progress:.1f}% - 准确率: {self.accuracy:.2f}%")
            self.save_progress()
        
        # 训练完成
        self.accuracy = 85.0 + random.random() * 10.0
        self.model_path = os.path.join(MODELS_DIR, f"model_{self.task_id}.pth")


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'message': '训练服务运行正常',
        'training_available': TRAINING_AVAILABLE,
        'timestamp': datetime.now().isoformat(),
        'active_tasks': len([t for t in training_tasks.values() if t.status == 'training'])
    })


@app.route('/train', methods=['POST'])
def start_training():
    """启动训练任务"""
    try:
        logger.info("收到训练请求，开始处理...")
        logger.info(f"请求方法: {request.method}")
        logger.info(f"请求URL: {request.url}")
        logger.info(f"请求头: {dict(request.headers)}")
        
        # 尝试获取JSON数据
        try:
            data = request.get_json()
            logger.info(f"成功获取JSON数据: {data}")
        except Exception as e:
            logger.error(f"获取JSON数据失败: {e}")
            data = None
        
        if data is None:
            logger.error("数据为空，返回错误")
            return jsonify({
                'success': False,
                'message': '请求数据为空'
            }), 400
        
        task_id = data.get('task_id')
        dataset_path = data.get('dataset_path')
        model_type = data.get('model_type', 'resnet18')
        epochs = data.get('epochs', 10)
        
        logger.info(f"数据集路径类型: {type(dataset_path)}")
        logger.info(f"数据集路径值: '{dataset_path}'")
        
        if not isinstance(dataset_path, str):
            logger.error(f"数据集路径格式错误: {dataset_path}")
            return jsonify({
                'success': False,
                'message': f'数据集路径格式错误: {dataset_path}'
            }), 400
        
        logger.info(f"检查数据集路径: {dataset_path}")
        logger.info(f"路径是否存在: {os.path.exists(dataset_path)}")
        
        if not os.path.exists(dataset_path):
            logger.error(f"数据集路径不存在: {dataset_path}")
            logger.info(f"当前工作目录: {os.getcwd()}")
            logger.info(f"DATASETS_DIR: {DATASETS_DIR}")
            logger.info(f"DATASETS_DIR是否存在: {os.path.exists(DATASETS_DIR)}")
            if os.path.exists(DATASETS_DIR):
                logger.info(f"DATASETS_DIR下的目录: {os.listdir(DATASETS_DIR)}")
            return jsonify({
                'success': False,
                'message': f'数据集不存在: {dataset_path}'
            }), 404
        
        logger.info(f"路径是否可读: {os.access(dataset_path, os.R_OK)}")
        
        if not os.access(dataset_path, os.R_OK):
            logger.error(f"无法访问数据集路径: {dataset_path}")
            return jsonify({
                'success': False,
                'message': f'无法访问数据集路径: {dataset_path}'
            }), 403
        
        logger.info(f"路径下的文件: {os.listdir(dataset_path)}")
        
        task = TrainingTask(task_id, dataset_path, model_type, epochs)
        training_tasks[task_id] = task
        
        thread = threading.Thread(target=task.run_training)
        task.thread = thread
        thread.start()
        
        logger.info(f"训练任务 {task_id} 已启动")
        
        return jsonify({
            'success': True,
            'message': '训练任务已启动',
            'task_id': task_id
        })
        
    except Exception as e:
        logger.error(f"启动训练任务失败: {e}")
        return jsonify({
            'success': False,
            'message': f'启动训练任务失败: {str(e)}'
        }), 500


@app.route('/progress/<int:task_id>', methods=['GET'])
def get_progress(task_id):
    """获取训练进度"""
    try:
        if task_id not in training_tasks:
            # 尝试从文件读取进度
            progress_file = os.path.join(PROGRESS_DIR, f"progress_{task_id}.json")
            if os.path.exists(progress_file):
                with open(progress_file, 'r', encoding='utf-8') as f:
                    progress_data = json.load(f)
                return jsonify(progress_data)
            else:
                return jsonify({
                    'success': False,
                    'message': f'任务不存在: {task_id}'
                }), 404
        
        task = training_tasks[task_id]
        task.save_progress()
        
        return jsonify({
            'task_id': task.task_id,
            'status': task.status,
            'progress': task.progress,
            'accuracy': task.accuracy,
            'model_path': task.model_path,
            'error': task.error,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"获取训练进度失败: {e}")
        return jsonify({
            'success': False,
            'message': f'获取训练进度失败: {str(e)}'
        }), 500


@app.route('/result/<int:task_id>', methods=['GET'])
def get_result(task_id):
    """获取训练结果"""
    try:
        if task_id not in training_tasks:
            return jsonify({
                'success': False,
                'message': f'任务不存在: {task_id}'
            }), 404
        
        task = training_tasks[task_id]
        
        if task.status == 'completed':
            return jsonify({
                'success': True,
                'task_id': task.task_id,
                'status': task.status,
                'model_path': task.model_path,
                'accuracy': task.accuracy,
                'start_time': task.start_time.isoformat() if task.start_time else None,
                'end_time': task.end_time.isoformat() if task.end_time else None
            })
        elif task.status == 'failed':
            return jsonify({
                'success': False,
                'task_id': task.task_id,
                'status': task.status,
                'error': task.error
            })
        else:
            return jsonify({
                'success': False,
                'task_id': task.task_id,
                'status': task.status,
                'message': '训练尚未完成'
            })
        
    except Exception as e:
        logger.error(f"获取训练结果失败: {e}")
        return jsonify({
            'success': False,
            'message': f'获取训练结果失败: {str(e)}'
        }), 500


@app.route('/', methods=['GET'])
def root():
    """API根路径"""
    return jsonify({
        'name': 'AI模型训练服务',
        'version': '1.0.0',
        'description': '提供AI模型训练功能',
        'endpoints': {
            'health': 'GET /health - 健康检查',
            'train': 'POST /train - 启动训练',
            'progress': 'GET /progress/<task_id> - 获取训练进度',
            'result': 'GET /result/<task_id> - 获取训练结果'
        },
        'training_available': TRAINING_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("=" * 60)
    print("        AI模型训练服务        ")
    print("=" * 60)
    print(f"训练可用: {'是' if TRAINING_AVAILABLE else '否 (使用模拟训练)'}")
    print(f"服务地址: http://localhost:8001")
    print("=" * 60)
    print("按 Ctrl+C 停止服务")
    
    app.run(host='0.0.0.0', port=8001, debug=False, threaded=True)
