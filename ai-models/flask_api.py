from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import cv2
import os
from ultralytics import YOLO
import time
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, BigInteger, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置上传文件夹
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 确保上传文件夹存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 静态文件服务路由
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploads(filename):
    """提供上传文件的静态访问"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error serving file: {e}")
        return jsonify({"error": "File not found"}), 404

# 数据库配置
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'urban_management')
DB_USERNAME = os.environ.get('DB_USERNAME', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'hst135178')

# 创建数据库连接
DATABASE_URL = f'postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 定义数据库模型
class Photo(Base):
    __tablename__ = 'photos'
    
    id = Column(Integer, primary_key=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    province = Column(String(100))
    city = Column(String(100))
    district = Column(String(100))
    street = Column(String(255))
    detailed_location = Column(Text)
    description = Column(Text)
    photo_type = Column(String(50))
    tags = Column(ARRAY(String))
    uploaded_by = Column(String(100))
    upload_time = Column(DateTime, default=datetime.utcnow)
    rating = Column(Float)
    ai_score_details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Rating(Base):
    __tablename__ = 'ratings'
    
    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, nullable=False)
    user_id = Column(Integer)
    overall_score = Column(Float)
    dimension_scores = Column(JSON)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 创建数据库表（如果不存在）
try:
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建成功")
except Exception as e:
    print(f"⚠️  数据库表创建失败: {e}")

# 数据库会话管理
def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e

# 加载YOLO模型（优先使用基础YOLO模型）
# 基础YOLO模型路径 - 使用最新的用户训练模型
base_model_path = 'runs/detect/yolov8n_full_20260201_000403/weights/best.pt'  # 使用用户训练的街道元素检测模型
print(f"使用基础YOLO模型: {base_model_path}")

# 增强YOLO模型，添加回归头功能
class EnhancedYOLO:
    def __init__(self, yolo_model):
        self.yolo = yolo_model
        self.regression_enabled = True
        self.regression_model = None
        
        # 尝试加载训练好的回归头模型
        import torch
        import torch.nn as nn
        
        # 查找回归头模型文件
        model_files = []
        models_dir = 'models'
        if os.path.exists(models_dir):
            model_files = [f for f in os.listdir(models_dir) if 'regression' in f and f.endswith('.pt')]
        
        if model_files:
            # 按修改时间排序，使用最新的模型
            model_files.sort(key=lambda x: os.path.getmtime(os.path.join(models_dir, x)), reverse=True)
            regression_model_path = os.path.join(models_dir, model_files[0])
            
            try:
                # 创建特征提取器
                self.feature_extractor = nn.Sequential(
                    nn.Conv2d(3, 64, kernel_size=3, stride=2, padding=1),
                    nn.SiLU(),
                    nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
                    nn.SiLU(),
                    nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
                    nn.SiLU(),
                    nn.Conv2d(256, 512, kernel_size=3, stride=2, padding=1),
                    nn.SiLU(),
                    nn.AdaptiveAvgPool2d(1)
                )
                
                # 创建回归头模型结构
                self.regression_model = nn.Sequential(
                    nn.Linear(512, 256),
                    nn.SiLU(),
                    nn.Dropout(0.3),
                    nn.Linear(256, 128),
                    nn.SiLU(),
                    nn.Dropout(0.2),
                    nn.Linear(128, 64),
                    nn.SiLU(),
                    nn.Linear(64, 1),  # 1个综合评分
                    nn.Sigmoid()  # 输出0-1，后续乘以100得到0-100分
                )
                
                # 加载模型权重
                checkpoint = torch.load(regression_model_path, map_location=torch.device('cpu'))
                if 'regression_head_state_dict' in checkpoint and 'feature_extractor_state_dict' in checkpoint:
                    self.regression_model.load_state_dict(checkpoint['regression_head_state_dict'])
                    self.feature_extractor.load_state_dict(checkpoint['feature_extractor_state_dict'])
                    self.regression_model.eval()
                    self.feature_extractor.eval()
                    print(f"✅ 成功加载回归头模型: {model_files[0]}")
                else:
                    print("⚠️  回归头模型文件格式不正确，使用默认评分逻辑")
            except Exception as e:
                print(f"⚠️  加载回归头模型失败: {e}")
                print("使用默认评分逻辑")
        else:
            print("⚠️  未找到回归头模型，使用默认评分逻辑")
        
        print("✅ 增强YOLO模型初始化成功")
        print("  支持同时输出检测结果和回归评分")
    
    def predict(self, img):
        # 运行YOLO检测
        detection_results = self.yolo(img)
        
        # 生成回归评分
        regression_scores = {}
        
        # 分析检测结果
        detected_objects = {}
        if len(detection_results) > 0:
            result = detection_results[0]
            if hasattr(result, 'boxes'):
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    class_name = class_names.get(class_id, f'class_{class_id}')
                    confidence = float(box.conf[0])
                    
                    if confidence > 0.45:
                        if class_name not in detected_objects:
                            detected_objects[class_name] = 0
                        detected_objects[class_name] += 1
        
        # 使用回归头模型进行评分
        if self.regression_model is not None and hasattr(self, 'feature_extractor'):
            import torch
            
            try:
                # 准备图像数据
                img_tensor = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0  # 转换为张量并归一化
                img_tensor = img_tensor.unsqueeze(0)  # 添加批次维度
                
                # 提取特征
                features = self.feature_extractor(img_tensor)
                features = features.view(features.size(0), -1)
                
                # 通过回归头模型
                with torch.no_grad():
                    regression_output = self.regression_model(features)
                    overall_score = float(regression_output.squeeze().numpy() * 100)  # 转换为0-100分
                
                # 使用回归头模型评分：基于10分为主的打分制
                # 训练规则：除了少量是否/有无的判断题，其余都是10分为主，5分为辅的打分制
                
                class_order = ['tree', 'sidewalk', 'store sign', 'Bicycle lane', 'urban facility']
                
                # 分配评分
                for class_name in class_order:
                    if class_name in detected_objects:
                        # 检测到的类别：基于10分制评分
                        # 根据检测数量和质量调整评分
                        count = detected_objects[class_name]
                        
                        # 基础评分：10分制（10分为主，5分为辅）
                        if count >= 3:
                            base_score = 10  # 数量多，给满分
                        elif count >= 2:
                            base_score = 8  # 数量中等，给高分
                        else:
                            base_score = 6  # 数量少，给中等分
                        
                        # 转换为0-100分制
                        class_score = base_score * 10  # 10分制转换为0-100分
                        
                        # 考虑图像质量微调（±10%）
                        # 临时使用默认质量分数，后续会在主函数中根据实际质量调整
                        quality_adjustment = 0
                        class_score = class_score * (1 + quality_adjustment)
                        
                        regression_scores[class_name] = max(60, min(class_score, 95))  # 提高下限，检测到的类别60-95分
                    else:
                        # 未检测到的类别：根据规则处理
                        # 绿化、人行道：必须评分，无则扣高分
                        if class_name in ['tree', 'sidewalk']:
                            regression_scores[class_name] = 20.0  # 重大问题，严重扣分（提高分数）
                        # 店招、自行车道、城市设施：无则不参与打分
                        else:
                            regression_scores[class_name] = None  # 不参与打分
                
                print(f"✅ 使用回归头模型评分: 综合评分={overall_score:.2f}, 类别评分={regression_scores}")
            except Exception as e:
                print(f"⚠️  使用回归头模型评分失败: {e}")
                # 回退到基于检测结果的评分
                self._fallback_scoring(detected_objects, regression_scores)
        else:
            # 使用基于检测结果的智能评分
            self._fallback_scoring(detected_objects, regression_scores)
        
        return detection_results, regression_scores
    
    def _fallback_scoring(self, detected_objects, regression_scores):
        """基于检测结果的回退评分逻辑"""
        # 绿化评分
        tree_count = detected_objects.get('tree', 0)
        if tree_count == 0:
            regression_scores['tree'] = 20  # 提高未检测到的分数
        else:
            base_score = 75  # 提高基础分数
            count_bonus = min(tree_count * 5, 25)  # 调整加分幅度
            regression_scores['tree'] = base_score + count_bonus
        
        # 人行道评分
        sidewalk_count = detected_objects.get('sidewalk', 0)
        if sidewalk_count == 0:
            regression_scores['sidewalk'] = 15  # 提高未检测到的分数
        else:
            base_score = 80  # 提高基础分数
            count_bonus = min(sidewalk_count * 10, 20)  # 调整加分幅度
            regression_scores['sidewalk'] = base_score + count_bonus
        
        # 店招评分
        store_sign_count = detected_objects.get('store sign', 0)
        if store_sign_count == 0:
            regression_scores['store sign'] = None  # 无店招不参与打分
        else:
            base_score = 65  # 提高基础分数
            count_bonus = min(store_sign_count * 4, 35)  # 调整加分幅度
            regression_scores['store sign'] = base_score + count_bonus
        
        # 自行车道评分
        bicycle_lane_count = detected_objects.get('Bicycle lane', 0)
        if bicycle_lane_count == 0:
            regression_scores['Bicycle lane'] = None  # 无自行车道不参与打分（后续根据人行道宽度调整）
        else:
            base_score = 70  # 提高基础分数
            count_bonus = min(bicycle_lane_count * 10, 30)  # 调整加分幅度
            regression_scores['Bicycle lane'] = base_score + count_bonus
        
        # 城市设施评分
        urban_facility_count = detected_objects.get('urban facility', 0)
        if urban_facility_count == 0:
            regression_scores['urban facility'] = None  # 无城市设施不参与打分
        else:
            base_score = 65  # 提高基础分数
            count_bonus = min(urban_facility_count * 5, 35)  # 调整加分幅度
            regression_scores['urban facility'] = base_score + count_bonus
        
        print(f"⚠️  使用回退评分逻辑: {regression_scores}")

# 加载基础YOLO模型
base_model = YOLO(base_model_path)
# 创建增强模型
model = EnhancedYOLO(base_model)
print(f"模型加载成功: {base_model_path}")

# 类别映射
class_names = {
    0: 'tree',
    1: 'sidewalk',
    2: 'store sign',
    3: 'Bicycle lane',
    4: 'urban facility'
}

# 类别到中文的映射
class_names_chinese = {
    'tree': '绿化',
    'sidewalk': '人行道',
    'store sign': '店招/建筑',
    'Bicycle lane': '自行车道',
    'urban facility': '城市设施'
}

# 默认评分（用于缺失的分数）
default_scores = {
    'tree': 0,
    'sidewalk': 0,
    'store sign': 0,
    'Bicycle lane': 0,
    'urban facility': 0
}

# 评分标准
scoring_criteria = {
    'tree': {
        'min_objects': 0,
        'max_objects': 10,
        'weight': 0.35  # 提高权重
    },
    'sidewalk': {
        'min_objects': 0,
        'max_objects': 5,
        'weight': 0.35  # 提高权重
    },
    'store sign': {
        'min_objects': 0,
        'max_objects': 8,
        'weight': 0.12  # 降低权重
    },
    'Bicycle lane': {
        'min_objects': 0,
        'max_objects': 3,
        'weight': 0.12  # 降低权重
    },
    'urban facility': {
        'min_objects': 0,
        'max_objects': 6,
        'weight': 0.06  # 降低权重
    }
}

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'success',
        'message': 'AI城市治理街道元素检测API',
        'version': '1.0',
        'endpoints': {
            'POST /predict': '上传图像进行街道元素检测和评分'
        },
        'usage': {
            'method': 'POST',
            'url': '/predict',
            'content_type': 'multipart/form-data',
            'parameters': {
                'file': '图像文件（必填）'
            }
        },
        'example': {
            'python': 'import requests\nfiles = {"file": open("image.jpg", "rb")}\nresponse = requests.post("http://localhost:5000/predict", files=files)\nprint(response.json())',
            'curl': 'curl -X POST http://localhost:5000/predict -F "file=@image.jpg"'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        start_time = time.time()
        
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            })
        
        file = request.files['file']
        
        # 读取图像
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            })
        
        # 调整图像大小
        img = cv2.resize(img, (416, 416))
        
        # 场景识别：检查是否为街道场景
        # 核心判断标准：如果照片中没有检测到任何街道元素，直接判断为非街道照片
        # 街道元素包括：绿化、人行道、自行车道、店招、城市设施
        
        # 定义街道元素集合
        street_elements = {'tree', 'sidewalk', 'Bicycle lane', 'store sign', 'urban facility'}
        
        # 增加详细日志
        print("\n=== 场景识别开始 ===")
        
        # 运行快速检测以检查是否存在街道元素
        quick_results = base_model(img, conf=0.45)  # 调整阈值，减少误检
        detected_elements = set()
        detected_objects = {}
        
        if len(quick_results) > 0:
            quick_result = quick_results[0]
            if hasattr(quick_result, 'boxes'):
                for box in quick_result.boxes:
                    class_id = int(box.cls[0])
                    class_name = class_names.get(class_id, f'class_{class_id}')
                    confidence = float(box.conf[0])
                    print(f"检测到元素: {class_name}, 置信度: {confidence:.2f}")
                    detected_elements.add(class_name)
                    # 统计检测到的对象数量
                    if confidence > 0.45:
                        if class_name not in detected_objects:
                            detected_objects[class_name] = 0
                        detected_objects[class_name] += 1
        
        # 检查是否包含至少一种街道元素
        has_street_elements = bool(street_elements & detected_elements)
        
        # 判断是否为非街道场景
        is_non_street = False
        
        # 核心判断：如果没有检测到任何街道元素，直接判断为非街道照片
        if not has_street_elements:
            is_non_street = True
            print(f"检测到非街道场景：未检测到任何街道元素，检测到的元素: {detected_elements}")
            print("根据核心逻辑：没有街道元素的照片不是街道照片")
        else:
            # 增强场景识别：分析检测到的元素
            # 检查检测到的元素数量是否合理
            detected_count = len(detected_elements)
            total_objects = sum(detected_objects.values())
            
            # 如果检测到的元素数量很少，可能是误检
            if detected_count == 1 and total_objects == 1:
                # 检查检测到的唯一元素的置信度
                for box in quick_result.boxes:
                    confidence = float(box.conf[0])
                    if confidence < 0.5:
                        is_non_street = True
                        print(f"检测到非街道场景：仅检测到一个低置信度元素，置信度: {confidence:.2f}")
                        break
            
            # 检查是否检测到了非街道元素（如果模型支持）
            # 例如：如果检测到了人、动物等非街道元素，可能是误检
            non_street_elements = set()
            for box in quick_result.boxes:
                class_id = int(box.cls[0])
                class_name = class_names.get(class_id, f'class_{class_id}')
                # 如果检测到的类别不在街道元素中，可能是误检
                if class_name not in street_elements:
                    non_street_elements.add(class_name)
            
            if len(non_street_elements) > 0 and len(detected_elements) == 1:
                is_non_street = True
                print(f"检测到非街道场景：主要检测到非街道元素: {non_street_elements}")
        
        print(f"场景识别结果: {'非街道场景' if is_non_street else '街道场景'}")
        print("=== 场景识别结束 ===")
        
        if is_non_street:
            return jsonify({
                'status': 'error',
                'message': '非街道场景图片，无法进行城市环境评分'
            })
        
        # 运行模型预测
        results, regression_scores = model.predict(img)
        
        # 分析结果
        detected_objects = {}
        
        # 检查是否有检测结果
        if len(results) > 0:
            result = results[0]
            
            # 获取YOLO检测结果
            if hasattr(result, 'boxes'):
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    class_name = class_names.get(class_id, f'class_{class_id}')
                    confidence = float(box.conf[0])
                    
                    if confidence > 0.45:
                        if class_name not in detected_objects:
                            detected_objects[class_name] = 0
                        detected_objects[class_name] += 1
            
            print(f"YOLO检测结果: {detected_objects}")
            print(f"回归头评分: {regression_scores}")
            

        print(f"最终检测结果: {detected_objects}")
        print(f"回归头评分: {regression_scores}")
        
        # 计算图像质量指标
        def calculate_image_quality(img):
            """计算图像质量指标"""
            # 转换为灰度图
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # 计算清晰度 (Laplacian方差)
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            sharpness = laplacian.var()
            
            # 计算亮度
            brightness = cv2.mean(gray)[0]
            
            # 计算对比度
            contrast = gray.std()
            
            # 计算饱和度
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            saturation = cv2.mean(hsv[:, :, 1])[0]
            
            return {
                'sharpness': sharpness,
                'brightness': brightness,
                'contrast': contrast,
                'saturation': saturation
            }
        
        # 计算图像质量
        quality_metrics = calculate_image_quality(img)
        print(f"图像质量指标: {quality_metrics}")
        
        # 计算评分 - 同时使用YOLO检测结果和回归头评分
        scores = {}
        total_score = 0
        total_weight = 0
        
        # 检测到的物体数量
        tree_count = detected_objects.get('tree', 0)
        sidewalk_count = detected_objects.get('sidewalk', 0)
        store_sign_count = detected_objects.get('store sign', 0)
        bicycle_lane_count = detected_objects.get('Bicycle lane', 0)
        urban_facility_count = detected_objects.get('urban facility', 0)
        
        print(f"开始计算评分，回归头评分: {regression_scores}")
        print(f"YOLO检测结果: tree={tree_count}, sidewalk={sidewalk_count}, store_sign={store_sign_count}, bicycle_lane={bicycle_lane_count}, urban_facility={urban_facility_count}")
        
        # 计算图像质量评分 (0-100) - 增加对最终评分的影响，扩展动态范围
        sharpness_score = min(quality_metrics['sharpness'] / 700 * 100, 100)  # 调整分母
        brightness_score = 100 - abs(quality_metrics['brightness'] - 128) / 128 * 100
        contrast_score = min(quality_metrics['contrast'] / 70 * 100, 100)  # 调整分母
        saturation_score = min(quality_metrics['saturation'] / 180 * 100, 100)  # 调整分母
        
        image_quality_score = (sharpness_score * 0.25 + brightness_score * 0.25 + 
                              contrast_score * 0.25 + saturation_score * 0.25)  # 均衡权重
        
        # 扩大图像质量评分的范围，增加动态性
        image_quality_score = max(60, min(image_quality_score, 98))
        
        print(f"图像质量评分: {image_quality_score:.2f}")
        
        # 同时使用回归头评分和YOLO检测结果
        # 策略：回归头评分提供质量评分，YOLO检测结果提供存在性验证和数量调整
        
        # 1. 绿化评分 (必须评分，无则扣高分)
        if regression_scores and 'tree' in regression_scores:
            # 基于10分为主的打分制，转换为0-100分
            base_tree_score = max(40, min(regression_scores['tree'], 95))  # 降低基础分数下限
            # 根据YOLO检测结果调整：如果没有检测到绿化，属于重大问题，扣高分
            if tree_count == 0:
                tree_score = 10  # 重大问题，严重扣分
            else:
                # 根据检测到的数量和质量调整，考虑管养水平、覆盖度、观赏性等
                count_adjustment = min(tree_count / 2, 0.5)  # 增加数量影响
                quality_adjustment = (image_quality_score / 100 - 0.7) * 0.2  # 增加质量影响
                tree_score = base_tree_score * (1 + count_adjustment + quality_adjustment)
            tree_score = max(0, min(tree_score, 95))  # 确保在0-95范围内
        else:
            # 使用YOLO检测结果计算
            if tree_count == 0:
                tree_score = 10  # 重大问题，严重扣分
            else:
                # 基于检测结果计算，考虑覆盖度和管养水平
                normalized_tree = min(tree_count / 4, 1.0)
                tree_score = normalized_tree * 70 + 30  # 扩大动态范围
        scores['tree'] = round(tree_score, 1)
        total_score += tree_score * scoring_criteria['tree']['weight']
        total_weight += scoring_criteria['tree']['weight']
        
        # 2. 人行道评分 (必须评分，无则扣高分)
        if regression_scores and 'sidewalk' in regression_scores:
            # 基于10分为主的打分制，转换为0-100分
            base_sidewalk_score = max(45, min(regression_scores['sidewalk'], 95))  # 降低基础分数下限
            # 根据YOLO检测结果调整：如果没有检测到人行道，属于重大问题，扣高分
            if sidewalk_count == 0:
                sidewalk_score = 8  # 重大问题，严重扣分
            else:
                # 根据检测到的数量和质量调整，考虑铺装破损度、整洁度、宽度等
                count_adjustment = min(sidewalk_count / 1.5, 0.5)  # 增加数量影响
                quality_adjustment = (image_quality_score / 100 - 0.7) * 0.2  # 增加质量影响
                sidewalk_score = base_sidewalk_score * (1 + count_adjustment + quality_adjustment)
            sidewalk_score = max(0, min(sidewalk_score, 95))  # 确保在0-95范围内
        else:
            # 使用YOLO检测结果计算
            if sidewalk_count == 0:
                sidewalk_score = 8  # 重大问题，严重扣分
            else:
                # 基于检测结果计算，考虑宽度和连续性
                normalized_sidewalk = min(sidewalk_count / 3, 1.0)
                sidewalk_score = normalized_sidewalk * 75 + 25  # 扩大动态范围
        scores['sidewalk'] = round(sidewalk_score, 1)
        total_score += sidewalk_score * scoring_criteria['sidewalk']['weight']
        total_weight += scoring_criteria['sidewalk']['weight']
        
        # 3. 店招/建筑评分 (无则不参与打分)
        if store_sign_count > 0:
            if regression_scores and 'store sign' in regression_scores:
                # 基于10分为主的打分制，转换为0-100分
                base_store_score = max(40, min(regression_scores['store sign'], 95))  # 降低基础分数下限
                # 考虑店招的色彩、样式、整洁度等因素
                count_adjustment = min(store_sign_count / 3, 0.5)  # 增加数量影响
                quality_adjustment = (image_quality_score / 100 - 0.7) * 0.2  # 增加质量影响
                store_score = base_store_score * (1 + count_adjustment + quality_adjustment)
                store_score = max(0, min(store_score, 95))  # 确保在0-95范围内
            else:
                # 基于检测结果计算
                normalized_store = min(store_sign_count / 5, 1.0)
                store_score = normalized_store * 70 + 30  # 扩大动态范围
            scores['store sign'] = round(store_score, 1)
            total_score += store_score * scoring_criteria['store sign']['weight']
            total_weight += scoring_criteria['store sign']['weight']
        else:
            # 无店招不参与打分，不扣分
            scores['store sign'] = None
        
        # 4. 自行车道评分 (根据人行道宽度决定)
        is_sidewalk_wide = sidewalk_count >= 3  # 调整判断标准，更符合"很宽"的定义
        is_sidewalk_medium = 1 <= sidewalk_count < 3  # 适中宽度
        
        if bicycle_lane_count > 0:
            if regression_scores and 'Bicycle lane' in regression_scores:
                base_bicycle_score = max(40, min(regression_scores['Bicycle lane'], 95))  # 降低基础分数下限
                count_adjustment = min(bicycle_lane_count / 1.5, 0.5)  # 增加数量影响
                quality_adjustment = (image_quality_score / 100 - 0.7) * 0.2  # 增加质量影响
                bicycle_score = base_bicycle_score * (1 + count_adjustment + quality_adjustment)
                bicycle_score = max(0, min(bicycle_score, 95))  # 确保在0-95范围内
            else:
                normalized_bicycle = min(bicycle_lane_count / 3, 1.0)
                bicycle_score = normalized_bicycle * 75 + 25  # 扩大动态范围
            scores['Bicycle lane'] = round(bicycle_score, 1)
            total_score += bicycle_score * scoring_criteria['Bicycle lane']['weight']
            total_weight += scoring_criteria['Bicycle lane']['weight']
        else:
            if is_sidewalk_wide:
                # 人行道很宽但未设置自行车道，需要扣分
                bicycle_score = 35  # 扣分（降低分数）
                scores['Bicycle lane'] = round(bicycle_score, 1)
                total_score += bicycle_score * scoring_criteria['Bicycle lane']['weight']
                total_weight += scoring_criteria['Bicycle lane']['weight']
            else:
                # 人行道不宽/适中，不扣分
                scores['Bicycle lane'] = None
        
        # 5. 城市设施评分 (无则不参与打分)
        if urban_facility_count > 0:
            if regression_scores and 'urban facility' in regression_scores:
                base_facility_score = max(40, min(regression_scores['urban facility'], 95))  # 降低基础分数下限
                count_adjustment = min(urban_facility_count / 2, 0.5)  # 增加数量影响
                quality_adjustment = (image_quality_score / 100 - 0.7) * 0.2  # 增加质量影响
                facility_score = base_facility_score * (1 + count_adjustment + quality_adjustment)
                facility_score = max(0, min(facility_score, 95))  # 确保在0-95范围内
            else:
                normalized_facility = min(urban_facility_count / 4, 1.0)
                facility_score = normalized_facility * 70 + 30  # 扩大动态范围
            scores['urban facility'] = round(facility_score, 1)
            total_score += facility_score * scoring_criteria['urban facility']['weight']
            total_weight += scoring_criteria['urban facility']['weight']
        else:
            # 无城市设施不参与打分，不扣分
            scores['urban facility'] = None
        
        print(f"最终评分: {scores}")
        
        # 检测是否为非街道照片（没有检测到任何街道元素）
        is_non_street_photo = len(detected_objects) == 0
        
        # 计算总体评分
        if is_non_street_photo:
            # 非街道照片，返回低评分
            overall_score = 0.0
        elif total_weight > 0:
            overall_score = round(total_score / total_weight, 1)
        else:
            # 没有有效的评分维度，返回低评分
            overall_score = 0.0
        
        # 确保评分合理：限制最高和最低分数范围
        overall_score = max(10.0, min(overall_score, 95.0))
        
        # 确保所有类别都有分数值，但按照规则处理：
        # 1. 无店招/城市设施不参与打分（设为None）
        # 2. 无绿化/人行道属于重大问题需扣高分
        # 3. 无自行车道根据人行道宽度决定
        
        # 检查并填充缺失的分数
        required_classes = ['tree', 'sidewalk']  # 必须评分的类别
        optional_classes = ['store sign', 'Bicycle lane', 'urban facility']  # 可选评分的类别
        
        # 确保必须评分的类别都有分数
        for class_name in required_classes:
            if class_name not in scores:
                if class_name == 'tree':
                    scores['tree'] = 10  # 无绿化扣高分
                elif class_name == 'sidewalk':
                    scores['sidewalk'] = 5  # 无人行道扣高分
        
        # 可选评分的类别，无则设为None（不参与打分）
        for class_name in optional_classes:
            if class_name not in scores:
                scores[class_name] = None
        
        # 转换为中文标签
        chinese_scores = {}
        for class_name, score in scores.items():
            chinese_name = class_names_chinese.get(class_name, class_name)
            # 确保分数不是None
            if score is None:
                score = default_scores.get(class_name, 0)
            chinese_scores[chinese_name] = score
        
        # 生成建议
        suggestions = generate_suggestions(detected_objects, scores)
        
        # 确定总体等级
        overall_level = get_overall_level(overall_score)
        
        # 计算处理时间
        processing_time = round(time.time() - start_time, 2)
        
        # 转换为前端期望的格式
        scores_english = {
            'shop_sign_building': scores.get('store sign', 0),
            'greenery_maintenance': scores.get('tree', 0),
            'greenery_coverage': scores.get('tree', 0),
            'sidewalk_damage': scores.get('sidewalk', 0),
            'bike_lane_connectivity': scores.get('Bicycle lane', 0),
            'urban_facilities_integrity': scores.get('urban facility', 0),
            'urban_facilities_damage': scores.get('urban facility', 0),
            'other': 0
        }
        
        # 计算置信度（基于检测到的对象数量和评分）
        detected_count = sum(detected_objects.values())
        confidence = min(95, 70 + detected_count * 5 + (overall_score / 10))
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_score': overall_score,
                'confidence': round(confidence, 1),
                'scores': scores_english,
                'overall_level': overall_level,
                'categories': chinese_scores,
                'detected_objects': detected_objects,
                'suggestions': suggestions,
                'processing_time': processing_time,
                'is_mock_data': False
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

def generate_suggestions(detected_objects, scores):
    """根据检测结果生成建议"""
    suggestions = []
    
    # 检查绿化
    tree_count = detected_objects.get('tree', 0)
    tree_score = scores.get('tree')
    if tree_score is not None:
        if tree_count == 0:
            suggestions.append('建议增加绿化覆盖，提升城市美观度和空气质量')
        elif tree_score < 80:
            suggestions.append('建议优化绿化布局，提高绿化质量')
    
    # 检查人行道
    sidewalk_count = detected_objects.get('sidewalk', 0)
    sidewalk_score = scores.get('sidewalk')
    if sidewalk_score is not None:
        if sidewalk_count == 0:
            suggestions.append('建议完善人行道设施，保障行人安全')
        elif sidewalk_score < 80:
            suggestions.append('建议改善人行道条件，提高通行舒适度')
    
    # 检查店招/建筑
    store_sign_count = detected_objects.get('store sign', 0)
    store_sign_score = scores.get('store sign')
    if store_sign_score is not None:
        if store_sign_count > 0 and store_sign_score < 80:
            suggestions.append('建议优化建筑外观，提高城市品质')
    
    # 检查自行车道
    bicycle_lane_count = detected_objects.get('Bicycle lane', 0)
    bicycle_lane_score = scores.get('Bicycle lane')
    if bicycle_lane_score is not None:
        if bicycle_lane_count == 0:
            # 只有在需要评分的情况下才建议
            suggestions.append('建议规划自行车道，鼓励绿色出行')
        elif bicycle_lane_score < 80:
            suggestions.append('建议改善自行车道条件，提高骑行安全性')
    
    # 检查城市设施
    urban_facility_count = detected_objects.get('urban facility', 0)
    urban_facility_score = scores.get('urban facility')
    if urban_facility_score is not None:
        if urban_facility_count > 0 and urban_facility_score < 80:
            suggestions.append('建议加强公共设施维护，提高使用体验')
    
    # 总体建议
    # 只计算有评分的类别的平均分数
    scored_values = [v for v in scores.values() if v is not None]
    if scored_values:
        average_score = sum(scored_values) / len(scored_values)
        if average_score < 70:
            suggestions.append('该区域整体环境需要较大改善，建议制定综合整治方案')
        elif average_score < 85:
            suggestions.append('该区域环境状况良好，建议进一步优化细节')
        else:
            suggestions.append('该区域环境质量优秀，建议作为示范区域推广')
    
    return suggestions

def get_overall_level(score):
    """根据总体评分确定等级"""
    if score >= 90:
        return '优秀'
    elif score >= 80:
        return '良好'
    elif score >= 70:
        return '一般'
    elif score >= 60:
        return '较差'
    else:
        return '差'

# 前端API兼容路由
@app.route('/api/ai/score', methods=['POST'])
def api_score():
    """前端API：图片评分"""
    try:
        # 调用现有的predict函数
        result = predict()
        
        # 转换为前端期望的格式
        if result.status_code == 200:
            data = result.get_json()
            if data.get('status') == 'success' and 'data' in data:
                result_data = data['data']
                return jsonify({
                    'overallScore': result_data.get('total_score', 0),
                    'dimensionScores': result_data.get('scores', {})
                })
        
        # 如果出错，返回错误信息
        return jsonify({
            'status': 'error',
            'message': '评分失败'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/score', methods=['POST'])
def api_batch_score():
    """前端API：批量图片评分"""
    try:
        # 调用现有的predict函数（前端会逐个调用）
        return predict()
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/api/ai/analyze', methods=['POST'])
def api_analyze():
    """前端API：图片分析"""
    try:
        # 调用现有的predict函数
        return predict()
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/api', methods=['GET'])
def api_info():
    """API信息"""
    return jsonify({
        'status': 'success',
        'message': 'AI城市治理街道元素检测API',
        'version': '1.0',
        'endpoints': {
            'POST /predict': '上传图像进行街道元素检测和评分',
            'POST /api/ai/score': '前端API：图片评分',
            'POST /api/score': '前端API：批量图片评分',
            'POST /api/ai/analyze': '前端API：图片分析'
        }
    })

# 单个照片上传端点
@app.route('/api/photos/upload', methods=['POST'])
def upload_photo():
    try:
        db = get_db()
        
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        
        # 保存文件
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        filename = os.path.join(upload_folder, file.filename)
        file.save(filename)
        
        # 获取文件信息
        file_size = os.path.getsize(filename)
        mime_type = file.mimetype or 'image/jpeg'
        
        # 获取元数据
        province = request.form.get('province')
        city = request.form.get('city')
        district = request.form.get('district')
        street = request.form.get('street')
        detailed_location = request.form.get('detailedLocation')
        description = request.form.get('description')
        photo_type = request.form.get('photoType', 'other')
        tags_str = request.form.get('tags')
        
        # 处理标签
        tags = []
        if tags_str:
            try:
                tags = json.loads(tags_str)
            except:
                tags = tags_str.split(',') if tags_str else []
        
        # 创建照片记录
        photo = Photo(
            file_name=file.filename,
            file_path=f'/uploads/{file.filename}',
            file_size=file_size,
            mime_type=mime_type,
            province=province,
            city=city,
            district=district,
            street=street,
            detailed_location=detailed_location,
            description=description,
            photo_type=photo_type,
            tags=tags,
            uploaded_by='current_user'
        )
        
        db.add(photo)
        db.commit()
        db.refresh(photo)
        
        db.close()
        
        return jsonify({
            'code': 200,
            'data': {
                'id': str(photo.id),
                'url': photo.file_path
            },
            'message': '上传成功'
        }), 200
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 批量照片上传端点
@app.route('/api/photos/upload/batch', methods=['POST'])
def batch_upload_photos():
    try:
        db = get_db()
        
        if 'files' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No files uploaded'
            }), 400
        
        files = request.files.getlist('files')
        if not files:
            return jsonify({
                'status': 'error',
                'message': 'No files selected'
            }), 400
        
        # 保存文件
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        results = []
        for file in files:
            try:
                filename = os.path.join(upload_folder, file.filename)
                file.save(filename)
                
                # 获取文件信息
                file_size = os.path.getsize(filename)
                mime_type = file.mimetype or 'image/jpeg'
                
                # 获取元数据
                province = request.form.get('province')
                city = request.form.get('city')
                district = request.form.get('district')
                street = request.form.get('street')
                detailed_location = request.form.get('detailedLocation')
                description = request.form.get('description')
                photo_type = request.form.get('photoType', 'other')
                tags_str = request.form.get('tags')
                
                # 处理标签
                tags = []
                if tags_str:
                    try:
                        tags = json.loads(tags_str)
                    except:
                        tags = tags_str.split(',') if tags_str else []
                
                # 创建照片记录
                photo = Photo(
                    file_name=file.filename,
                    file_path=f'/uploads/{file.filename}',
                    file_size=file_size,
                    mime_type=mime_type,
                    province=province,
                    city=city,
                    district=district,
                    street=street,
                    detailed_location=detailed_location,
                    description=description,
                    photo_type=photo_type,
                    tags=tags,
                    uploaded_by='current_user'
                )
                
                db.add(photo)
                db.commit()
                db.refresh(photo)
                
                results.append({
                    'fileName': file.filename,
                    'size': file_size,
                    'success': True,
                    'id': photo.id
                })
            except Exception as e:
                print(f"❌ 上传照片失败: {file.filename}, 错误: {str(e)}")
                import traceback
                traceback.print_exc()
                results.append({
                    'fileName': file.filename,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify(results), 200
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 照片列表端点
@app.route('/api/photos/', methods=['GET'])
def get_photos():
    try:
        db = get_db()
        
        # 获取查询参数
        page = int(request.args.get('page', 1))
        size = int(request.args.get('size', 10))
        keyword = request.args.get('keyword', '')
        province = request.args.get('province', '')
        city = request.args.get('city', '')
        district = request.args.get('district', '')
        photo_type = request.args.get('photoType', '')
        
        # 构建查询
        query = db.query(Photo)
        
        # 添加筛选条件
        if keyword:
            query = query.filter(
                (Photo.file_name.ilike(f'%{keyword}%')) |
                (Photo.description.ilike(f'%{keyword}%'))
            )
        if province:
            query = query.filter(Photo.province == province)
        if city:
            query = query.filter(Photo.city == city)
        if district:
            query = query.filter(Photo.district == district)
        if photo_type:
            query = query.filter(Photo.photo_type == photo_type)
        
        # 分页
        query = query.order_by(Photo.upload_time.desc())
        total = query.count()
        photos = query.offset((page - 1) * size).limit(size).all()
        
        # 转换为前端期望的格式
        photo_list = []
        for photo in photos:
            photo_list.append({
                'id': photo.id,
                'fileName': photo.file_name,
                'name': photo.file_name,
                'url': photo.file_path,
                'filePath': photo.file_path,
                'fileSize': photo.file_size,
                'mimeType': photo.mime_type,
                'province': photo.province,
                'city': photo.city,
                'district': photo.district,
                'street': photo.street,
                'detailedLocation': photo.detailed_location,
                'description': photo.description,
                'photoType': photo.photo_type,
                'tags': photo.tags or [],
                'uploadedBy': photo.uploaded_by,
                'uploadTime': photo.upload_time.isoformat() if photo.upload_time else '',
                'rating': float(photo.rating) if photo.rating else None,
                'aiScoreDetails': photo.ai_score_details
            })
        
        db.close()
        
        return jsonify({
            'success': True,
            'data': photo_list,
            'total': total,
            'page': page,
            'size': size
        }), 200
    except Exception as e:
        if 'db' in locals():
            db.close()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# 更新照片评分端点
@app.route('/api/photos/<photo_id>', methods=['PUT'])
def update_photo(photo_id):
    try:
        db = get_db()
        
        # 获取请求参数
        data = request.get_json()
        rating = data.get('rating')
        
        # 查找照片
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Photo not found'
            }), 404
        
        # 更新评分
        if rating is not None:
            photo.rating = rating
        
        db.commit()
        db.refresh(photo)
        db.close()
        
        return jsonify({
            'success': True,
            'rating': float(photo.rating) if photo.rating else 0
        }), 200
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# 删除照片端点
@app.route('/api/photos/<photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    try:
        db = get_db()
        
        # 查找照片
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Photo not found'
            }), 404
        
        # 删除物理文件
        try:
            file_path = photo.file_path
            if file_path and file_path.startswith('/uploads/'):
                file_name = file_path.replace('/uploads/', '')
                full_path = os.path.join(UPLOAD_FOLDER, file_name)
                if os.path.exists(full_path):
                    os.remove(full_path)
                    print(f"已删除文件: {full_path}")
        except Exception as e:
            print(f"删除文件失败: {e}")
        
        # 删除数据库记录
        db.delete(photo)
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': 'Photo deleted successfully'
        }), 200
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# 更新照片评分（多维度）端点
@app.route('/api/photos/<photo_id>/rating', methods=['PUT'])
def update_photo_rating(photo_id):
    try:
        db = get_db()
        
        # 获取请求参数
        data = request.get_json()
        rating = data.get('rating')
        dimension_scores = data.get('dimensionScores')
        
        # 查找照片
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Photo not found'
            }), 404
        
        # 更新评分
        if rating is not None:
            photo.rating = rating
        if dimension_scores is not None:
            photo.ai_score_details = dimension_scores
        
        db.commit()
        db.refresh(photo)
        db.close()
        
        return jsonify({
            'success': True,
            'rating': float(photo.rating) if photo.rating else 0,
            'dimensionScores': photo.ai_score_details
        }), 200
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # 确保uploads文件夹存在
    import os
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(host='0.0.0.0', port=8080, debug=False)
