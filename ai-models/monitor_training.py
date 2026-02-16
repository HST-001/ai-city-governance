#!/usr/bin/env python3
"""
训练进度监控脚本
实时查看训练进度和日志
"""

import os
import re
import glob
from datetime import datetime

def find_latest_training():
    """查找最新的训练运行"""
    # YOLO训练结果保存在runs/detect目录
    runs_dir = 'runs/detect'
    
    if not os.path.exists(runs_dir):
        print("❌ 未找到训练运行目录")
        return None
    
    # 查找所有训练运行
    train_runs = [d for d in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, d))]
    
    if not train_runs:
        print("❌ 未找到任何训练运行")
        return None
    
    # 按修改时间排序，获取最新的
    train_runs.sort(key=lambda x: os.path.getmtime(os.path.join(runs_dir, x)), reverse=True)
    latest_run = train_runs[0]
    
    return os.path.join(runs_dir, latest_run)

def parse_training_log(run_dir):
    """解析训练日志"""
    # 查找训练日志文件
    log_files = glob.glob(os.path.join(run_dir, '*.log'))
    
    if not log_files:
        print("❌ 未找到训练日志文件")
        return None
    
    # 读取最新的日志文件
    log_file = max(log_files, key=os.path.getmtime)
    
    with open(log_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 提取训练进度信息
    progress_info = {
        'current_epoch': 0,
        'total_epochs': 0,
        'best_map': 0.0,
        'last_update': None
    }
    
    for line in reversed(lines):
        # 查找epoch信息
        epoch_match = re.search(r'Epoch\s+(\d+)/(\d+)', line)
        if epoch_match:
            progress_info['current_epoch'] = int(epoch_match.group(1))
            progress_info['total_epochs'] = int(epoch_match.group(2))
            break
        
        # 查找mAP信息
        map_match = re.search(r'mAP50-95:\s+([\d.]+)', line)
        if map_match:
            progress_info['best_map'] = float(map_match.group(1))
    
    # 获取最后更新时间
    progress_info['last_update'] = datetime.fromtimestamp(os.path.getmtime(log_file))
    
    return progress_info

def check_checkpoints(run_dir):
    """检查检查点文件"""
    pt_files = glob.glob(os.path.join(run_dir, '*.pt'))
    
    checkpoints = []
    for pt_file in pt_files:
        file_info = {
            'name': os.path.basename(pt_file),
            'size': os.path.getsize(pt_file) / (1024 * 1024),  # MB
            'modified': datetime.fromtimestamp(os.path.getmtime(pt_file))
        }
        checkpoints.append(file_info)
    
    # 按修改时间排序
    checkpoints.sort(key=lambda x: x['modified'], reverse=True)
    
    return checkpoints

def main():
    """主函数"""
    print("=" * 70)
    print("📊 训练进度监控")
    print("=" * 70)
    print(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 查找最新训练
    run_dir = find_latest_training()
    
    if not run_dir:
        print("❌ 未找到训练运行")
        return
    
    print(f"训练目录: {run_dir}")
    print()
    
    # 解析训练日志
    progress_info = parse_training_log(run_dir)
    
    if progress_info:
        print("📈 训练进度:")
        print(f"  当前Epoch: {progress_info['current_epoch']}/{progress_info['total_epochs']}")
        if progress_info['total_epochs'] > 0:
            progress_percent = (progress_info['current_epoch'] / progress_info['total_epochs']) * 100
            print(f"  进度: {progress_percent:.1f}%")
        print(f"  最佳mAP50-95: {progress_info['best_map']:.4f}")
        print(f"  最后更新: {progress_info['last_update'].strftime('%Y-%m-%d %H:%M:%S')}")
        print()
    
    # 检查检查点
    checkpoints = check_checkpoints(run_dir)
    
    if checkpoints:
        print("💾 检查点文件:")
        for i, cp in enumerate(checkpoints, 1):
            print(f"  {i}. {cp['name']}")
            print(f"     大小: {cp['size']:.2f} MB")
            print(f"     修改时间: {cp['modified'].strftime('%Y-%m-%d %H:%M:%S')}")
        print()
    
    # 检查训练是否正在运行
    print("🔍 训练状态:")
    if progress_info and checkpoints:
        # 检查最后修改时间
        last_checkpoint_time = checkpoints[0]['modified']
        time_diff = (datetime.now() - last_checkpoint_time).total_seconds()
        
        if time_diff < 300:  # 5分钟内有更新
            print("  ✅ 训练可能正在运行")
        elif time_diff < 3600:  # 1小时内有更新
            print("  ⚠️  训练可能已暂停或中断")
        else:
            print("  ❌ 训练可能已停止")
    else:
        print("  ❓ 无法确定训练状态")
    
    print()
    print("=" * 70)

if __name__ == '__main__':
    main()
