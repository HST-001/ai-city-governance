#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
城市环境评分系统 - API服务器

这是一个轻量级的API服务器，即使在没有安装PyTorch等深度学习库的情况下
也能提供基础的API功能和模拟评分数据
"""

import os
import sys
import base64
import json
import io
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# 创建Flask应用实例
app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 模拟评分数据生成函数
def generate_mock_scores():
    """
    生成模拟的环境评分数据
    """
    import random
    
    # 模拟五个维度的评分（1-5分）
    categories = {
        "store_sign": random.randint(2, 5),         # 店招/建筑
        "greenery": random.randint(1, 5),           # 绿化
        "sidewalk": random.randint(2, 5),           # 人行道
        "bike_lane": random.randint(2, 5),          # 非机动车道
        "urban_facilities": random.randint(2, 5)    # 城市设施
    }
    
    # 计算加权平均评分
    weights = {
        "store_sign": 0.2,
        "greenery": 0.2,
        "sidewalk": 0.2,
        "bike_lane": 0.2,
        "urban_facilities": 0.2
    }
    
    weighted_sum = sum(categories[dim] * weights[dim] for dim in categories)
    average_score = weighted_sum / sum(weights.values())
    average_score = round(average_score, 1)  # 保留一位小数
    
    # 根据评分获取等级
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
    
    # 获取整体等级
    overall_level = get_level(average_score)
    
    # 生成详细子维度评分
    subdimensions = {
        "store_sign": {
            "色彩": random.randint(2, 5),
            "样式": random.randint(2, 5),
            "整洁度": random.randint(2, 5),
            "安全性": random.randint(2, 5),
            "合规性": random.randint(2, 5),
            "夜间效果": random.randint(2, 5)
        },
        "greenery": {
            "管养水平": random.randint(1, 5),
            "覆盖度": random.randint(1, 5),
            "观赏性": random.randint(1, 5),
            "遮阴性": random.randint(1, 5),
            "生态性": random.randint(1, 5)
        },
        "sidewalk": {
            "铺装破损度": random.randint(2, 5),
            "整洁度": random.randint(2, 5),
            "无障碍友好性": random.randint(2, 5),
            "连续性": random.randint(2, 5),
            "宽度合理性": random.randint(2, 5)
        },
        "bike_lane": {
            "有无": random.randint(1, 5),
            "安全性": random.randint(2, 5),
            "连续性": random.randint(2, 5),
            "自行车停放设置": random.randint(2, 5)
        },
        "urban_facilities": {
            "有无": random.randint(2, 5),
            "维护状况": random.randint(2, 5),
            "色彩样式": random.randint(2, 5),
            "功能性": random.randint(2, 5)
        }
    }
    
    # 生成评分时间
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 返回完整的评分结果
    return {
        "status": "success",
        "timestamp": timestamp,
        "data": {
            "categories": categories,
            "subdimensions": subdimensions,
            "overall_score": average_score,
            "overall_level": overall_level,
            "suggestions": generate_suggestions(categories, average_score),
            "is_mock_data": True  # 标记为模拟数据
        }
    }

def generate_suggestions(categories, avg_score):
    """
    基于评分生成改进建议
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

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({
        "status": "healthy",
        "message": "城市环境评分系统 API 服务运行正常",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "1.0.0"
    })

# 预测接口
@app.route('/predict', methods=['POST'])
def predict():
    """
    环境评分预测接口
    接受图片上传并返回评分结果（这里使用模拟数据）
    """
    try:
        # 检查请求中是否包含文件
        if 'file' not in request.files:
            # 检查是否有JSON数据
            if request.is_json:
                data = request.get_json()
                # 如果有图片的base64编码
                if 'image' in data and isinstance(data['image'], str):
                    print("接收到图片base64编码，长度:", len(data['image']))
                else:
                    print("接收到JSON数据，但没有图片信息")
            else:
                return jsonify({
                    "status": "error",
                    "message": "请提供图片文件或图片数据"
                }), 400
        else:
            # 获取上传的文件
            file = request.files['file']
            # 检查文件是否为空
            if file.filename == '':
                return jsonify({
                    "status": "error",
                    "message": "未选择图片文件"
                }), 400
            
            # 检查文件类型
            allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif'}
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            if file_extension not in allowed_extensions:
                return jsonify({
                    "status": "error",
                    "message": "不支持的文件类型，请上传 JPG、PNG 或 GIF 格式的图片"
                }), 400
            
            # 记录接收到的文件信息
            print(f"接收到图片文件: {file.filename}, 大小: {len(file.read())} 字节")
            # 将文件指针重置到开头
            file.seek(0)
        
        # 生成模拟评分数据
        result = generate_mock_scores()
        
        return jsonify(result)
    
    except Exception as e:
        # 记录错误信息
        print(f"处理请求时出错: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "status": "error",
            "message": f"处理请求时发生错误: {str(e)}"
        }), 500

# 根路径，提供API信息
@app.route('/', methods=['GET'])
def root():
    """
    API服务根路径
    """
    return jsonify({
        "name": "城市环境评分系统 API",
        "version": "1.0.0",
        "description": "提供城市环境图片评分和分析功能",
        "endpoints": {
            "health": "GET /health - 健康检查",
            "predict": "POST /predict - 上传图片获取评分"
        },
        "running_mode": "基础模式 (模拟数据)",
        "note": "当前运行在基础模式，使用模拟评分数据。如需真实AI评分功能，请安装PyTorch等深度学习依赖。"
    })

# 启动服务器
if __name__ == '__main__':
    # 确保services目录存在
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    
    # 打印启动信息
    print("=" * 60)
    print("        城市环境评分系统 - API 服务        ")
    print("=" * 60)
    print("服务启动中...")
    print("- 模式: 基础模式 (使用模拟数据)")
    print("- 地址: http://localhost:5000")
    print("- 接口: GET /health (健康检查)")
    print("- 接口: POST /predict (图片评分)")
    print("- 说明: 如需真实AI评分，请安装PyTorch等依赖")
    print("=" * 60)
    print("按 Ctrl+C 停止服务")
    
    # 启动Flask应用
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
