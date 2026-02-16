#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
部署脚本 - 自动化YOLOv8替换EfficientNet的部署流程
"""

import os
import sys
import logging
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DeploymentManager:
    """部署管理器"""
    
    def __init__(self):
        """初始化部署管理器"""
        self.deployment_log = {
            'start_time': datetime.now().isoformat(),
            'deployment_steps': [],
            'errors': [],
            'warnings': [],
            'status': 'in_progress'
        }
        
        # 部署配置
        self.config = {
            'backup_dir': 'models/backup',
            'models_dir': 'models',
            'adapters_dir': 'models/adapters',
            'scripts_dir': 'scripts',
            'data_dir': 'data/yolo_dataset',
            'test_results_dir': 'models/test_results'
        }
    
    def log_step(self, step_name, status, message):
        """
        记录部署步骤
        
        Args:
            step_name: 步骤名称
            status: 状态（success/failure/skipped）
            message: 消息
        """
        step_info = {
            'step': step_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        self.deployment_log['deployment_steps'].append(step_info)
        
        # 输出到日志
        if status == 'success':
            logger.info(f"✅ {step_name}: {message}")
        elif status == 'failure':
            logger.error(f"❌ {step_name}: {message}")
        else:
            logger.warning(f"⏭️ {step_name}: {message}")
    
    def backup_existing_models(self):
        """备份现有模型"""
        step_name = "备份现有模型"
        
        try:
            logger.info("开始备份现有模型...")
            
            # 创建备份目录
            backup_dir = self.config['backup_dir']
            os.makedirs(backup_dir, exist_ok=True)
            
            # 创建带时间戳的备份目录
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = os.path.join(backup_dir, f'backup_{timestamp}')
            os.makedirs(backup_path, exist_ok=True)
            
            # 备份现有模型文件
            models_dir = self.config['models_dir']
            if os.path.exists(models_dir):
                # 备份.pth文件
                for file in os.listdir(models_dir):
                    if file.endswith('.pth'):
                        src = os.path.join(models_dir, file)
                        dst = os.path.join(backup_path, file)
                        shutil.copy2(src, dst)
                        logger.debug(f"备份模型文件: {file}")
            
            self.log_step(step_name, 'success', f'模型已备份到: {backup_path}')
            return True
            
        except Exception as e:
            error_msg = f"备份失败: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
    
    def install_dependencies(self):
        """安装依赖"""
        step_name = "安装依赖"
        
        try:
            logger.info("开始安装依赖...")
            
            # 检查是否已安装ultralytics
            try:
                import ultralytics
                logger.info("ultralytics已安装，跳过安装")
                self.log_step(step_name, 'skipped', 'ultralytics已安装')
                return True
            except ImportError:
                pass
            
            # 安装ultralytics
            logger.info("安装ultralytics...")
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', 'ultralytics',
                '-i', 'https://pypi.tuna.tsinghua.edu.cn/simple'
            ], check=True, capture_output=True)
            
            self.log_step(step_name, 'success', '依赖安装完成')
            return True
            
        except subprocess.CalledProcessError as e:
            error_msg = f"依赖安装失败: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
        except Exception as e:
            error_msg = f"依赖安装异常: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
    
    def convert_data(self):
        """转换数据格式"""
        step_name = "转换数据格式"
        
        try:
            logger.info("开始转换数据格式...")
            
            # 检查Label Studio JSON文件是否存在
            label_studio_json = r"C:\Users\hy\Downloads\project-1-at-2026-01-27-23-07-203d9713.json"
            if not os.path.exists(label_studio_json):
                warning_msg = f"Label Studio JSON文件不存在: {label_studio_json}"
                self.deployment_log['warnings'].append(warning_msg)
                self.log_step(step_name, 'skipped', warning_msg)
                return True
            
            # 运行数据转换脚本
            convert_script = os.path.join(self.config['scripts_dir'], 'convert_to_yolo.py')
            if not os.path.exists(convert_script):
                warning_msg = f"数据转换脚本不存在: {convert_script}"
                self.deployment_log['warnings'].append(warning_msg)
                self.log_step(step_name, 'skipped', warning_msg)
                return True
            
            # 执行数据转换
            logger.info("执行数据转换...")
            subprocess.run([
                sys.executable, convert_script
            ], check=True, capture_output=True)
            
            self.log_step(step_name, 'success', '数据转换完成')
            return True
            
        except subprocess.CalledProcessError as e:
            error_msg = f"数据转换失败: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
        except Exception as e:
            error_msg = f"数据转换异常: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
    
    def run_tests(self):
        """运行测试"""
        step_name = "运行测试"
        
        try:
            logger.info("开始运行测试...")
            
            # 检查测试脚本是否存在
            test_script = os.path.join(self.config['scripts_dir'], 'test_system.py')
            if not os.path.exists(test_script):
                warning_msg = f"测试脚本不存在: {test_script}"
                self.deployment_log['warnings'].append(warning_msg)
                self.log_step(step_name, 'skipped', warning_msg)
                return True
            
            # 执行测试
            logger.info("执行系统测试...")
            result = subprocess.run([
                sys.executable, test_script
            ], capture_output=True, text=True)
            
            # 检查测试结果
            if result.returncode == 0:
                self.log_step(step_name, 'success', '所有测试通过')
                return True
            else:
                error_msg = f"测试失败: {result.stderr}"
                self.deployment_log['errors'].append(error_msg)
                self.log_step(step_name, 'failure', error_msg)
                return False
            
        except Exception as e:
            error_msg = f"测试执行异常: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
    
    def train_yolov8(self):
        """训练YOLOv8模型"""
        step_name = "训练YOLOv8模型"
        
        try:
            logger.info("开始训练YOLOv8模型...")
            
            # 检查训练脚本是否存在
            train_script = os.path.join(self.config['scripts_dir'], 'train_yolov8.py')
            if not os.path.exists(train_script):
                warning_msg = f"训练脚本不存在: {train_script}"
                self.deployment_log['warnings'].append(warning_msg)
                self.log_step(step_name, 'skipped', warning_msg)
                return True
            
            # 检查数据集是否存在
            data_yaml = os.path.join(self.config['data_dir'], 'dataset.yaml')
            if not os.path.exists(data_yaml):
                warning_msg = f"数据集配置文件不存在: {data_yaml}"
                self.deployment_log['warnings'].append(warning_msg)
                self.log_step(step_name, 'skipped', warning_msg)
                return True
            
            # 执行训练
            logger.info("执行YOLOv8训练...")
            subprocess.run([
                sys.executable, train_script
            ], check=True, capture_output=True)
            
            self.log_step(step_name, 'success', 'YOLOv8模型训练完成')
            return True
            
        except subprocess.CalledProcessError as e:
            error_msg = f"YOLOv8训练失败: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
        except Exception as e:
            error_msg = f"YOLOv8训练异常: {str(e)}"
            self.deployment_log['errors'].append(error_msg)
            self.log_step(step_name, 'failure', error_msg)
            return False
    
    def deploy(self):
        """执行部署"""
        logger.info("=" * 80)
        logger.info("开始部署YOLOv8替换EfficientNet")
        logger.info("=" * 80)
        
        # 1. 备份现有模型
        if not self.backup_existing_models():
            logger.error("备份失败，部署中止")
            self.deployment_log['status'] = 'failed'
            self.save_deployment_log()
            return False
        
        # 2. 安装依赖
        if not self.install_dependencies():
            logger.error("依赖安装失败，部署中止")
            self.deployment_log['status'] = 'failed'
            self.save_deployment_log()
            return False
        
        # 3. 转换数据格式
        if not self.convert_data():
            logger.warning("数据转换失败，继续部署")
        
        # 4. 运行测试
        if not self.run_tests():
            logger.error("测试失败，部署中止")
            self.deployment_log['status'] = 'failed'
            self.save_deployment_log()
            return False
        
        # 5. 训练YOLOv8模型（可选）
        logger.info("YOLOv8模型训练为可选步骤，如需训练请手动执行")
        
        # 部署成功
        self.deployment_log['status'] = 'success'
        self.deployment_log['end_time'] = datetime.now().isoformat()
        self.save_deployment_log()
        
        logger.info("=" * 80)
        logger.info("部署完成！")
        logger.info("=" * 80)
        
        # 打印部署摘要
        self.print_deployment_summary()
        
        return True
    
    def save_deployment_log(self):
        """保存部署日志"""
        try:
            log_dir = 'models/deployment_logs'
            os.makedirs(log_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            log_file = os.path.join(log_dir, f'deployment_{timestamp}.json')
            
            import json
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(self.deployment_log, f, ensure_ascii=False, indent=2)
            
            logger.info(f"部署日志已保存到: {log_file}")
        except Exception as e:
            logger.error(f"保存部署日志失败: {e}")
    
    def print_deployment_summary(self):
        """打印部署摘要"""
        logger.info("")
        logger.info("部署摘要:")
        logger.info(f"  开始时间: {self.deployment_log['start_time']}")
        logger.info(f"  结束时间: {self.deployment_log.get('end_time', 'N/A')}")
        logger.info(f"  状态: {self.deployment_log['status']}")
        logger.info(f"  总步骤数: {len(self.deployment_log['deployment_steps'])}")
        logger.info(f"  成功步骤: {sum(1 for s in self.deployment_log['deployment_steps'] if s['status'] == 'success')}")
        logger.info(f"  失败步骤: {sum(1 for s in self.deployment_log['deployment_steps'] if s['status'] == 'failure')}")
        logger.info(f"  跳过步骤: {sum(1 for s in self.deployment_log['deployment_steps'] if s['status'] == 'skipped')}")
        logger.info(f"  警告数: {len(self.deployment_log['warnings'])}")
        logger.info(f"  错误数: {len(self.deployment_log['errors'])}")
        logger.info("")
        
        if self.deployment_log['warnings']:
            logger.info("警告:")
            for warning in self.deployment_log['warnings']:
                logger.info(f"  - {warning}")
            logger.info("")
        
        if self.deployment_log['errors']:
            logger.error("错误:")
            for error in self.deployment_log['errors']:
                logger.error(f"  - {error}")
            logger.info("")
        
        logger.info("=" * 80)


def main():
    """主函数"""
    # 创建部署管理器
    deployer = DeploymentManager()
    
    # 执行部署
    success = deployer.deploy()
    
    # 返回部署结果
    if success:
        logger.info("🎉 部署成功！")
        return 0
    else:
        logger.error("❌ 部署失败，请检查日志")
        return 1


if __name__ == '__main__':
    sys.exit(main())
