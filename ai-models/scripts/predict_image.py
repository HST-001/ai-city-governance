#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
预测评估脚本，用于对新图片进行城市环境评分
"""

import os
import sys
import json
import argparse
import logging
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
import torchvision.models as models
import matplotlib.pyplot as plt

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 定义项目目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
ARCHITECTURES_DIR = os.path.join(MODELS_DIR, 'architectures')
EVALUATION_DIR = os.path.join(MODELS_DIR, 'evaluation')

# 确保目录存在
os.makedirs(EVALUATION_DIR, exist_ok=True)

# 定义评分维度和等级映射
RATING_DIMENSIONS = {
    'store_sign': {
        'name': '店招/建筑',
        'subdimensions': ['色彩', '样式', '整洁度', '安全性', '合规性', '夜间效果']
    },
    'greenery': {
        'name': '绿化',
        'subdimensions': ['管养水平', '覆盖度', '观赏性', '遮阴性', '生态性']
    },
    'sidewalk': {
        'name': '人行道',
        'subdimensions': ['铺装破损度', '整洁度', '无障碍友好性', '连续性', '宽度合理性', '排水系统', '夜间照明']
    },
    'bike_lane': {
        'name': '非机动车道',
        'subdimensions': ['有无', '安全性', '连续性', '自行车停放设置']
    },
    'urban_facilities': {
        'name': '城市设施',
        'subdimensions': ['有无', '维护状况', '色彩样式', '功能性']
    }
}

RATING_LEVELS = {
    0: {'level': 1, 'desc': '差'},
    1: {'level': 2, 'desc': '较差'},
    2: {'level': 3, 'desc': '一般'},
    3: {'level': 4, 'desc': '良好'},
    4: {'level': 5, 'desc': '优秀'}
}

# 维度权重配置
DIMENSION_WEIGHTS = {
    'store_sign': 0.2,
    'greenery': 0.2,
    'sidewalk': 0.2,
    'bike_lane': 0.2,
    'urban_facilities': 0.2
}

# 定义图像预处理转换
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class StreetRatingModel(torch.nn.Module):
    """单维度街道评分模型"""
    def __init__(self, num_classes=5):
        super(StreetRatingModel, self).__init__()
        # 使用预训练的EfficientNet-B0作为基础特征提取器
        self.backbone = models.efficientnet_b0(pretrained=True)
        
        # 替换最后的全连接层
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.2),
            torch.nn.Linear(num_features, num_classes)
        )
    
    def forward(self, x):
        output = self.backbone(x)
        return output

def load_model(dimension, model_path=None):
    """
    加载指定维度的训练好的模型
    
    Args:
        dimension (str): 评分维度
        model_path (str, optional): 模型文件路径. 如果为None，则尝试加载默认路径的模型
        
    Returns:
        tuple: (模型, 设备)
    """
    # 如果没有提供模型路径，则使用默认路径
    if model_path is None:
        model_path = os.path.join(MODELS_DIR, dimension, f'{dimension}_model.pth')
    
    # 检查模型文件是否存在
    if not os.path.exists(model_path):
        logger.warning(f"模型文件不存在: {model_path}")
        return None, None
    
    # 初始化模型
    model = StreetRatingModel()
    
    # 设置设备
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    # 加载模型参数
    try:
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        logger.info(f"成功加载{dimension}维度模型: {model_path}")
    except Exception as e:
        logger.error(f"加载模型失败: {e}")
        return None, None
    
    # 设置模型为评估模式
    model.eval()
    
    return model, device

def preprocess_image(image_path):
    """
    预处理输入图像
    
    Args:
        image_path (str): 图像文件路径
        
    Returns:
        torch.Tensor: 预处理后的图像张量
    """
    try:
        # 加载图像并转换为RGB
        image = Image.open(image_path).convert('RGB')
        
        # 应用预处理转换
        image_tensor = image_transform(image)
        
        # 添加批次维度
        image_tensor = image_tensor.unsqueeze(0)
        
        return image_tensor
    except Exception as e:
        logger.error(f"预处理图像失败 {image_path}: {e}")
        raise

def predict_single_image(image_path):
    """
    对单张图像进行多维度预测
    
    Args:
        image_path (str): 图像文件路径
        
    Returns:
        dict: 预测结果字典
    """
    # 预处理图像
    image_tensor = preprocess_image(image_path)
    
    # 存储各维度预测结果
    category_results = {}
    subdimension_results = {}
    dimension_scores = []
    
    # 为每个维度加载模型并进行预测
    for dimension in RATING_DIMENSIONS:
        # 加载模型
        model, device = load_model(dimension)
        
        if model and device:
            # 移动图像到设备
            image_tensor = image_tensor.to(device)
            
            # 进行预测
            with torch.no_grad():
                output = model(image_tensor)
            
            # 获取预测结果
            _, predicted_class = torch.max(output, 1)
            class_idx = predicted_class.item()
            
            # 获取等级信息
            level_info = RATING_LEVELS[class_idx]
            level = level_info['level']
            level_desc = level_info['desc']
            confidence = torch.softmax(output, dim=1)[0, class_idx].item()
            
            # 存储结果
            category_results[dimension] = level
            dimension_scores.append(level)
            
            # 生成子维度评分（模拟）
            subdimensions = RATING_DIMENSIONS[dimension]['subdimensions']
            subdimension_scores = {}
            for subdim in subdimensions:
                # 基于主维度评分生成子维度评分，添加一些随机波动
                base_score = level
                random_offset = np.random.uniform(-0.5, 0.5)
                sub_score = max(1, min(5, base_score + random_offset))
                subdimension_scores[subdim] = round(sub_score, 1)
            subdimension_results[dimension] = subdimension_scores
        else:
            # 使用默认评分
            default_score = 3  # 一般
            category_results[dimension] = default_score
            dimension_scores.append(default_score)
            
            # 生成默认子维度评分
            subdimensions = RATING_DIMENSIONS[dimension]['subdimensions']
            subdimension_scores = {subdim: 3.0 for subdim in subdimensions}
            subdimension_results[dimension] = subdimension_scores
    
    # 计算加权平均评分
    weighted_sum = sum(score * DIMENSION_WEIGHTS[dim] for dim, score in zip(RATING_DIMENSIONS, dimension_scores))
    overall_score = weighted_sum / sum(DIMENSION_WEIGHTS.values())
    overall_score = round(overall_score, 1)
    
    # 确定整体等级
    def get_level(score):
        if score >= 4.5:
            return "优秀"
        elif score >= 3.5:
            return "良好"
        elif score >= 2.5:
            return "一般"
        elif score >= 1.5:
            return "较差"
        else:
            return "差"
    
    overall_level = get_level(overall_score)
    
    # 生成建议
    suggestions = generate_suggestions(category_results, overall_score)
    
    # 构建完整结果
    results = {
        "categories": category_results,
        "subdimensions": subdimension_results,
        "overall_score": overall_score,
        "overall_level": overall_level,
        "suggestions": suggestions,
        "is_mock_data": any(load_model(dim)[0] is None for dim in RATING_DIMENSIONS)
    }
    
    return results

def generate_suggestions(categories, avg_score):
    """
    基于评分生成改进建议
    
    Args:
        categories (dict): 各维度评分
        avg_score (float): 平均评分
        
    Returns:
        list: 建议列表
    """
    suggestions = []
    
    # 针对低分项提供建议
    if categories.get("store_sign", 5) <= 2:
        suggestions.append("优化店招设计，保持整洁美观，确保符合相关规范")
    
    if categories.get("greenery", 5) <= 2:
        suggestions.append("加强绿化管养，增加绿化覆盖面积，提升植物多样性")
    
    if categories.get("sidewalk", 5) <= 2:
        suggestions.append("修复人行道铺装破损，确保无障碍设施完善，提升整洁度")
    
    if categories.get("bike_lane", 5) <= 2:
        suggestions.append("完善非机动车道建设，确保连续性和安全性，增加自行车停放设施")
    
    if categories.get("urban_facilities", 5) <= 2:
        suggestions.append("增加城市公共设施，加强维护管理，提升设施功能性和美观度")
    
    # 如果整体评分较高，添加肯定性建议
    if avg_score >= 4:
        suggestions.append("整体环境状况良好，建议继续保持和优化现有管理措施")
    
    # 如果建议太少，添加一些通用建议
    while len(suggestions) < 2:
        general_suggestions = [
            "定期进行城市环境质量监测和评估",
            "鼓励公众参与环境维护和监督",
            "制定长期环境改善计划和目标",
            "加强环境教育和宣传工作，提高市民环保意识",
            "优化城市空间布局，提升整体环境品质",
            "建立健全环境管理长效机制"
        ]
        
        # 添加一个不在当前建议列表中的通用建议
        import random
        suggestion = random.choice(general_suggestions)
        if suggestion not in suggestions:
            suggestions.append(suggestion)
    
    return suggestions

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
        plt.figure(figsize=(12, 8))
        
        # 显示原始图像
        plt.subplot(2, 1, 1)
        plt.imshow(image)
        plt.title('原始图像')
        plt.axis('off')
        
        # 显示评分结果
        plt.subplot(2, 1, 2)
        
        # 准备数据
        dimension_names = [RATING_DIMENSIONS[dim]['name'] for dim in results['categories']]
        scores = list(results['categories'].values())
        
        # 创建评分条形图
        bars = plt.bar(range(len(dimension_names)), scores, color=['red', 'orange', 'yellow', 'lightgreen', 'green'])
        
        # 添加标签和标题
        plt.xlabel('评分维度')
        plt.ylabel('评分等级 (1-5)')
        plt.title(f'综合评分: {results["overall_score"]} ({results["overall_level"]})')
        
        # 设置x轴刻度标签
        plt.xticks(range(len(dimension_names)), dimension_names, rotation=45, ha='right')
        
        # 设置y轴范围
        plt.ylim(0, 6)
        
        # 在条形图上方添加数值标签
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                    f'{height}', ha='center', va='bottom')
        
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

def batch_predict(image_dir, visualize=True, output_json=None):
    """
    批量预测目录中的所有图像
    
    Args:
        image_dir (str): 图像目录路径
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
    
    # 存储所有预测结果
    all_results = {}
    
    # 对每个图像进行预测
    for i, image_path in enumerate(image_files):
        logger.info(f"处理图像 {i+1}/{len(image_files)}: {image_path}")
        
        try:
            # 进行预测
            results = predict_single_image(image_path)
            
            # 存储结果
            image_name = os.path.basename(image_path)
            all_results[image_name] = results
            
            # 可视化结果（如果需要）
            if visualize:
                visualize_prediction(image_path, results)
                
            # 打印结果摘要
            logger.info(f"  图像: {image_name}")
            logger.info(f"  综合评分: {results['overall_score']} ({results['overall_level']})")
            for dim, score in results['categories'].items():
                dim_name = RATING_DIMENSIONS[dim]['name']
                logger.info(f"  {dim_name}: {score}分")
                
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
    parser = argparse.ArgumentParser(description='城市环境评分模型预测工具')
    
    # 添加参数
    parser.add_argument('input_path', help='输入图像路径或目录路径')
    parser.add_argument('--visualize', '-v', action='store_true', help='是否可视化预测结果')
    parser.add_argument('--output', '-o', help='批量预测结果输出JSON文件路径', default=None)
    
    # 解析命令行参数
    args = parser.parse_args()
    
    try:
        # 检查输入路径是文件还是目录
        if os.path.isfile(args.input_path):
            # 单张图像预测
            logger.info(f"预测单张图像: {args.input_path}")
            results = predict_single_image(args.input_path)
            
            # 打印结果
            logger.info("预测结果:")
            logger.info(f"综合评分: {results['overall_score']} ({results['overall_level']})")
            for dim, score in results['categories'].items():
                dim_name = RATING_DIMENSIONS[dim]['name']
                logger.info(f"{dim_name}: {score}分")
            
            logger.info("\n处理建议:")
            for rec in results['suggestions']:
                logger.info(f"- {rec}")
            
            # 可视化结果（如果需要）
            if args.visualize:
                visualize_prediction(args.input_path, results)
                
        elif os.path.isdir(args.input_path):
            # 批量预测
            batch_predict(args.input_path, args.visualize, args.output)
            
        else:
            logger.error(f"输入路径不存在: {args.input_path}")
            return
            
    except Exception as e:
        logger.error(f"预测失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
