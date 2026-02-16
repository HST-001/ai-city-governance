#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
城市环境评分系统 - 启动服务脚本

本脚本用于启动API服务，支持基础模式（无需PyTorch）和完整模式（需PyTorch和OpenCV）。
即使在没有PyTorch的环境中，也可以运行基础模式提供模拟评分数据。
"""

import os
import sys
import time
import subprocess
import importlib.util
import platform
import requests
from datetime import datetime

# 设置彩色终端输出
class Colors:
    RESET = "\033[0m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"

# 检测是否支持彩色输出
USE_COLOR = True
if os.name == 'nt':
    # Windows系统确保彩色输出正常工作
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except:
        USE_COLOR = False

# 打印彩色文本
def print_color(text, color=Colors.WHITE, end="\n"):
    """
    打印彩色文本
    """
    if USE_COLOR:
        print(f"{color}{text}{Colors.RESET}", end=end)
    else:
        print(text, end=end)

# 打印分隔线
def print_separator(char='-', length=60, color=Colors.CYAN):
    """
    打印分隔线
    """
    print_color(char * length, color)

# 检查Python版本
def check_python_version():
    """
    检查Python版本是否满足要求
    """
    print_color("\n📊 [步骤1] 检查Python环境...", Colors.CYAN)
    
    # 获取当前Python版本
    major, minor, patch = platform.python_version_tuple()
    current_version = f"{major}.{minor}.{patch}"
    
    print_color(f"  当前Python版本: {current_version}", Colors.WHITE)
    
    # 检查是否满足最低版本要求（Python 3.7+）
    if (int(major), int(minor)) < (3, 7):
        print_color("  ❌ Python版本过低，建议升级到Python 3.7或更高版本", Colors.RED)
        return False
    else:
        print_color("  ✅ Python版本检查通过", Colors.GREEN)
        return True

# 检查基础依赖
def check_basic_dependencies():
    """
    检查基础依赖是否已安装
    """
    print_color("\n🔍 [步骤2] 检查基础依赖...", Colors.CYAN)
    
    # 基础依赖列表
    basic_deps = {
        'flask': 'Flask',
        'numpy': 'numpy',
        'requests': 'requests'
    }
    
    # 检查每个依赖
    missing_deps = []
    for pip_name, import_name in basic_deps.items():
        try:
            importlib.import_module(import_name)
            print_color(f"  ✅ 已安装: {pip_name}", Colors.GREEN)
        except ImportError:
            print_color(f"  ❌ 未安装: {pip_name}", Colors.RED)
            missing_deps.append(pip_name)
    
    # 返回缺失的依赖列表
    return missing_deps

# 安装依赖
def install_dependencies(packages, use_mirror=True):
    """
    安装指定的依赖包
    """
    if not packages:
        return True
    
    print_color("\n📦 [步骤3] 安装缺失的依赖...", Colors.CYAN)
    
    # 构建pip安装命令
    command = [sys.executable, "-m", "pip", "install"]
    
    # 如果使用镜像源
    if use_mirror and platform.system() == "Windows":
        # 使用国内镜像源
        command.extend(["-i", "https://pypi.tuna.tsinghua.edu.cn/simple"])
    
    # 添加要安装的包
    command.extend(packages)
    
    # 执行安装命令
    try:
        print_color(f"  执行安装命令: {' '.join(command)}", Colors.WHITE)
        subprocess.check_call(command)
        print_color("  ✅ 依赖安装成功", Colors.GREEN)
        return True
    except subprocess.CalledProcessError:
        print_color("  ❌ 依赖安装失败", Colors.RED)
        return False

# 检查可选依赖
def check_optional_dependencies():
    """
    检查可选依赖（PyTorch和OpenCV）
    """
    print_color("\n🔍 [步骤4] 检查可选依赖...", Colors.CYAN)
    
    # 检查PyTorch
    has_torch = False
    try:
        import torch
        has_torch = True
        print_color(f"  ✅ 已安装PyTorch: {torch.__version__}", Colors.GREEN)
    except ImportError:
        print_color("  ⚠️  未安装PyTorch，将以基础模式运行", Colors.YELLOW)
    
    # 检查OpenCV
    has_cv2 = False
    try:
        import cv2
        has_cv2 = True
        print_color(f"  ✅ 已安装OpenCV: {cv2.__version__}", Colors.GREEN)
    except ImportError:
        print_color("  ⚠️  未安装OpenCV，将以基础模式运行", Colors.YELLOW)
    
    # 返回检测结果
    return has_torch, has_cv2

# 检查端口是否可用
def check_port_availability(port):
    """
    检查指定端口是否可用
    """
    print_color("\n🔍 [步骤5] 检查端口可用性...", Colors.CYAN)
    
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            # 尝试绑定到指定端口
            s.bind(("localhost", port))
            print_color(f"  ✅ 端口 {port} 可用", Colors.GREEN)
            return True
        except socket.error:
            print_color(f"  ❌ 端口 {port} 已被占用", Colors.RED)
            return False

# 启动API服务
def start_api_server(port=5000, has_torch=False, has_cv2=False):
    """
    启动API服务器
    """
    print_color("\n🚀 [步骤6] 启动API服务...", Colors.CYAN)
    print_color(f"  服务将在端口 {port} 上启动", Colors.BLUE)
    
    # 设置服务模式
    run_mode = "高级模式" if has_torch and has_cv2 else "基础模式"
    print_color(f"  服务运行模式: {run_mode}", Colors.MAGENTA)
    
    # 导入API服务器模块
    try:
        # 添加当前目录到Python路径
        script_dir = os.path.dirname(os.path.abspath(__file__))
        if script_dir not in sys.path:
            sys.path.append(script_dir)
        
        # 导入API服务器模块
        from services.api_server import app
        
        # 设置运行模式标志
        app.config['RUN_MODE'] = "advanced" if has_torch and has_cv2 else "basic"
        app.config['HAS_TORCH'] = has_torch
        app.config['HAS_CV2'] = has_cv2
        
        # 启动服务器
        print_separator("=", 70, Colors.CYAN)
        print_color(f"\n🌐 API服务已启动 ({run_mode})", Colors.GREEN)
        print_color(f"📡 访问地址: http://localhost:{port}", Colors.BLUE)
        print_color(f"🔍 健康检查: http://localhost:{port}/health", Colors.BLUE)
        print_color(f"🎯 预测接口: http://localhost:{port}/predict", Colors.BLUE)
        print_color("\n💡 使用提示:", Colors.YELLOW)
        print_color("  • 如需测试API功能，请运行 simple_test_tool.py", Colors.WHITE)
        print_color("  • 如需停止服务，请按 Ctrl+C", Colors.WHITE)
        if run_mode == "基础模式":
            print_color("  • 当前为基础模式，提供模拟评分数据", Colors.WHITE)
            print_color("  • 安装PyTorch和OpenCV可启用真实图片分析功能", Colors.WHITE)
        print_separator("=", 70, Colors.CYAN)
        
        # 运行Flask应用
        app.run(host="0.0.0.0", port=port, debug=False)
    except Exception as e:
        print_color(f"\n❌ 启动API服务时出错: {str(e)}", Colors.RED)
        print_color("\n🔧 解决方案:", Colors.YELLOW)
        print_color("  • 检查是否有其他程序占用了端口 {port}", Colors.WHITE)
        print_color("  • 确保所有必要的依赖都已正确安装", Colors.WHITE)
        print_color("  • 如需手动指定端口，可使用命令: python start_service.py <端口号>", Colors.WHITE)
        return False

# 主函数
def main():
    """
    主函数
    """
    # 获取命令行参数中的端口号
    port = 5000  # 默认端口
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print_color(f"警告: 无效的端口号参数 '{sys.argv[1]}'，使用默认端口 5000", Colors.YELLOW)
    
    try:
        # 打印程序标题
        print_separator("=", 70, Colors.CYAN)
        print_color("\n" + " " * 20 + "城市环境评分系统 - 服务启动脚本", Colors.MAGENTA)
        print_separator("=", 70, Colors.CYAN)
        print_color(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", Colors.BLUE)
        
        # 检查Python版本
        if not check_python_version():
            print_color("\n❌ Python版本不满足要求，程序无法继续", Colors.RED)
            input("\n按Enter键退出...")
            return 1
        
        # 检查基础依赖
        missing_basic_deps = check_basic_dependencies()
        
        # 安装缺失的基础依赖
        if missing_basic_deps:
            if not install_dependencies(missing_basic_deps):
                print_color("\n❌ 无法安装所有必要的依赖，程序无法继续", Colors.RED)
                input("\n按Enter键退出...")
                return 1
            else:
                # 安装成功后重新导入模块
                importlib.invalidate_caches()
        
        # 检查端口是否可用
        if not check_port_availability(port):
            # 尝试使用其他端口
            for alt_port in [5001, 5002, 5003]:
                if check_port_availability(alt_port):
                    port = alt_port
                    print_color(f"⚠️  将使用备用端口: {port}", Colors.YELLOW)
                    break
            else:
                print_color("\n❌ 无法找到可用端口，程序无法继续", Colors.RED)
                input("\n按Enter键退出...")
                return 1
        
        # 检查可选依赖
        has_torch, has_cv2 = check_optional_dependencies()
        
        # 启动API服务
        start_api_server(port, has_torch, has_cv2)
        
        return 0
    except KeyboardInterrupt:
        print_color("\n\n👋 服务已被用户中断，再见!", Colors.YELLOW)
        return 0
    except Exception as e:
        print_color(f"\n❌ 程序运行出错: {str(e)}", Colors.RED)
        import traceback
        print_color("\n详细错误信息:", Colors.RED)
        traceback.print_exc()
        input("\n按Enter键退出...")
        return 1

# 入口点
if __name__ == "__main__":
    sys.exit(main())