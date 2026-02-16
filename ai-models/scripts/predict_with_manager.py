#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
预测评估脚本 - 使用新的模型管理器进行城市环境评分
"""

import os
import sys
import json
import argparse
import logging
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入模型管理器
from models.model_manager import ModelManager, RATING_DIMENSIONS, RATING_LEVELS, DIMENSION_WEIGHTS

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 定义项目目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVALUATION_DIR = os.path.join(BASE_DIR, 'models', 'evaluation')

# 确保目录存在
os.makedirs(EVALUATION_DIR, exist_ok=True)


def predict_single_image(image_path, model_name=None):
    """
    对单张图像进行多维度预测
    
    Args:
        image_path (str): 图像文件路径
        model_name (str): 模型名称，默认使用默认模型
        
    Returns:
        dict: 预测结果字典
    """
    # 检查图像文件是否存在
    if not os.path.exists(image_path):
        logger.error(f"图像文件不存在: {image_path}")
        return {}
    
    # 创建模型管理器
    model_manager = ModelManager()
    
    # 使用模型管理器预测
    results = model_manager.predict(image_path, model_name)
    
    if not results:
        logger.error("预测失败，返回空结果")
        return {}
    
    # 添加图像信息
    results['image_path'] = image_path
    results['image_name'] = os.path.basename(image_path)
    
    return results


def format_results_for_display(results):
    """
    格式化结果用于显示
    
    Args:
        results (dict): 预测结果
        
    Returns:
        dict: 格式化后的结果
    """
    formatted = {
        'image_name': results.get('image_name', 'unknown'),
        'overall_score': results.get('overall', {}).get('score', 0),
        'overall_level': results.get('overall', {}).get('description', '未知'),
        'dimensions': {},
        'recommendations': results.get('recommendations', []),
        'model_info': results.get('model_info', {})
    }
    
    # 格式化各维度评分
    for dimension in DIMENSION_WEIGHTS:
        if dimension in results:
            dim_result = results[dimension]
            formatted['dimensions'][dimension] = {
                'name': RATING_DIMENSIONS[dimension]['name'],
                'level': dim_result.get('level', 3),
                'description': dim_result.get('description', '一般'),
                'confidence': dim_result.get('confidence', 0.5)
            }
    
    return formatted


def visualize_prediction(image_path, results, output_dir=None):
    """
    可视化预测结果
    
    Args:
        image_path (str): 原始图像路径
        results (dict): 预测结果
        output_dir (str, optional): 输出目录. 如果为None，则使用默认评估目录
    """
    if output_dir is None:
        output_dir = EVALUATION_DIR
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # 加载图像
        image = Image.open(image_path).convert('RGB')
        
        # 创建可视化图表
        plt.figure(figsize=(14, 10))
        
        # 显示原始图像
        plt.subplot(2, 2, 1)
        plt.imshow(image)
        plt.title('原始图像')
        plt.axis('off')
        
        # 显示评分结果
        plt.subplot(2, 2, 2)
        
        # 准备数据
        dimension_names = [RATING_DIMENSIONS[dim]['name'] for dim in DIMENSION_WEIGHTS]
        scores = [results.get(dim, {}).get('level', 3) for dim in DIMENSION_WEIGHTS]
        
        # 创建评分条形图
        colors = ['red' if score <= 2 else 'orange' if score <= 3 else 'yellow' if score <= 4 else 'lightgreen' for score in scores]
        bars = plt.bar(range(len(dimension_names)), scores, color=colors)
        
        # 添加标签和标题
        plt.xlabel('评分维度')
        plt.ylabel('评分等级 (1-5)')
        overall_score = results.get('overall', {}).get('score', 0)
        overall_level = results.get('overall', {}).get('description', '未知')
        plt.title(f'综合评分: {overall_score} ({overall_level})')
        
        # 设置x轴刻度标签
        plt.xticks(range(len(dimension_names)), dimension_names, rotation=45, ha='right')
        
        # 设置y轴范围
        plt.ylim(0, 6)
        
        # 在条形图上方添加数值标签
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                    f'{height}', ha='center', va='bottom')
        
        # 显示建议
        plt.subplot(2, 1, 2)
        recommendations = results.get('recommendations', [])
        plt.axis('off')
        plt.title('改进建议')
        
        # 显示建议列表
        for i, rec in enumerate(recommendations):
            plt.text(0, 1 - i*0.15, f"{i+1}. {rec}", fontsize=10, verticalalignment='top')
        
        # 调整布局
        plt.tight_layout()
        
        # 保存图像
        output_filename = os.path.splitext(os.path.basename(image_path))[0]
        output_path = os.path.join(output_dir, f'{output_filename}_prediction.png')
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"预测结果可视化已保存到: {output_path}")
        
    except Exception as e:
        logger.error(f"可视化预测结果失败: {e}")


def visualize_with_detections(image_path, results, output_dir=None):
    """
    可视化检测结果（仅适用于YOLOv8模型）
    
    Args:
        image_path (str): 原始图像路径
        results (dict): 预测结果
        output_dir (str, optional): 输出目录
    """
    if 'detections' not in results or not results['detections']:
        logger.info("没有检测结果，使用普通可视化")
        visualize_prediction(image_path, results, output_dir)
        return
    
    if output_dir is None:
        output_dir = EVALUATION_DIR
    
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        from PIL import ImageDraw, ImageFont
        
        # 加载图像
        image = Image.open(image_path).convert('RGB')
        draw = ImageDraw.Draw(image)
        
        # 尝试加载字体
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        # 定义颜色
        colors = {
            'tree': 'green',
            'sidewalk': 'blue',
            'store sign': 'red',
            'Bicycle lane': 'orange',
            'urban facility': 'purple'
        }
        
        # 绘制检测结果
        for detection in results['detections']:
            class_name = detection.get('class', 'unknown')
            bbox = detection.get('bbox', [])
            conf = detection.get('confidence', 0)
            
            if len(bbox) == 4:
                x1, y1, x2, y2 = bbox
                
                # 绘制边界框
                color = colors.get(class_name, 'white')
                draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
                
                # 绘制标签
                label = f"{class_name}: {conf:.2f}"
                draw.text((x1, y1 - 25), label, fill=color, font=font)
        
        # 保存检测结果图像
        output_filename = os.path.splitext(os.path.basename(image_path))[0]
        output_path = os.path.join(output_dir, f'{output_filename}_detections.png')
        image.save(output_path)
        
        logger.info(f"检测结果可视化已保存到: {output_path}")
        
    except Exception as e:
        logger.error(f"可视化检测结果失败: {e}")
        # 失败时使用普通可视化
        visualize_prediction(image_path, results, output_dir)


def batch_predict(image_dir, model_name=None, visualize=True, output_json=None):
    """
    批量预测目录中的所有图像
    
    Args:
        image_dir (str): 图像目录路径
        model_name (str): 模型名称
        visualize (bool): 是否可视化结果
        output_json (str, optional): 输出JSON文件路径
        
    Returns:
        dict: 所有图像的预测结果
    """
    # 检查目录是否存在
    if not os.path.isdir(image_dir):
        raise NotADirectoryError(f"目录不存在: {image_dir}")
    
    # 获取所有图像文件
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif']
    image_files = []
    
    for root, _, files in os.walk(image_dir):
        for file in files:
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_files.append(os.path.join(root, file))
    
    if not image_files:
        logger.warning(f"目录中没有找到图像文件: {image_dir}")
        return {}
    
    logger.info(f"找到 {len(image_files)} 个图像文件，开始批量预测...")
    
    # 创建模型管理器
    model_manager = ModelManager()
    
    # 存储所有预测结果
    all_results = {}
    
    # 对每个图像进行预测
    for i, image_path in enumerate(image_files):
        logger.info(f"处理图像 {i+1}/{len(image_files)}: {image_path}")
        
        try:
            # 进行预测
            results = model_manager.predict(image_path, model_name)
            
            # 添加图像信息
            results['image_path'] = image_path
            results['image_name'] = os.path.basename(image_path)
            
            # 存储结果
            image_name = os.path.basename(image_path)
            all_results[image_name] = results
            
            # 打印结果摘要
            logger.info(f"  图像: {image_name}")
            overall = results.get('overall', {})
            logger.info(f"  综合评分: {overall.get('score', 0)} ({overall.get('description', '未知')})")
            
            # 可视化结果（如果需要）
            if visualize:
                if 'detections' in results:
                    visualize_with_detections(image_path, results)
                else:
                    visualize_prediction(image_path, results)
                
        except Exception as e:
            logger.error(f"处理图像失败 {image_path}: {e}")
            # 存储失败信息
            image_name = os.path.basename(image_path)
            all_results[image_name] = {'error': str(e)}
    
    # 保存结果到JSON文件（如果提供了路径）
    if output_json:
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)
        logger.info(f"批量预测结果已保存到: {output_json}")
    
    return all_results


def main():
    """
    主函数
    """
    # 创建命令行参数解析器
    parser = argparse.ArgumentParser(description='城市环境评分模型预测工具（支持YOLOv8和EfficientNet）')
    
    # 添加参数
    parser.add_argument('input_path', help='输入图像路径或目录路径')
    parser.add_argument('--model', '-m', help='模型名称（yolov8/efficientnet/resnet18），默认使用默认模型', default=None)
    parser.add_argument('--visualize', '-v', action='store_true', help='是否可视化预测结果')
    parser.add_argument('--output', '-o', help='批量预测结果输出JSON文件路径', default=None)
    parser.add_argument('--show-detections', '-d', action='store_true', help='是否显示检测结果（仅YOLOv8）')
    
    # 解析命令行参数
    args = parser.parse_args()
    
    try:
        # 检查输入路径是文件还是目录
        if os.path.isfile(args.input_path):
            # 单张图像预测
            logger.info(f"预测单张图像: {args.input_path}")
            results = predict_single_image(args.input_path, args.model)
            
            if not results:
                logger.error("预测失败")
                return
            
            # 格式化结果
            formatted = format_results_for_display(results)
            
            # 打印结果
            logger.info("=" * 80)
            logger.info("预测结果:")
            logger.info("=" * 80)
            logger.info(f"图像: {formatted['image_name']}")
            logger.info(f"综合评分: {formatted['overall_score']} ({formatted['overall_level']})")
            logger.info("")
            logger.info("各维度评分:")
            for dim, info in formatted['dimensions'].items():
                logger.info(f"  {info['name']}: {info['level']}分 ({info['description']}) - 置信度: {info['confidence']:.2f}")
            
            logger.info("")
            logger.info("改进建议:")
            for i, rec in enumerate(formatted['recommendations'], 1):
                logger.info(f"  {i}. {rec}")
            
            logger.info("")
            logger.info("模型信息:")
            model_info = formatted['model_info']
            logger.info(f"  模型名称: {model_info.get('model_name', 'unknown')}")
            logger.info(f"  模型类型: {model_info.get('model_type', 'unknown')}")
            
            # 可视化结果（如果需要）
            if args.visualize:
                if args.show_detections and 'detections' in results:
                    visualize_with_detections(args.input_path, results)
                else:
                    visualize_prediction(args.input_path, results)
                
        elif os.path.isdir(args.input_path):
            # 批量预测
            batch_predict(args.input_path, args.model, args.visualize, args.output)
            
        else:
            logger.error(f"输入路径不存在: {args.input_path}")
            return
            
    except Exception as e:
        logger.error(f"预测失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
