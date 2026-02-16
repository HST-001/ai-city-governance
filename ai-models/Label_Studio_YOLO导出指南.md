# 使用Label Studio的YOLO导出功能 - 完整操作指南

## 🎯 推荐选择：YOLO with Images

**理由**：
- ✅ 包含图像，不需要单独下载
- ✅ 标准的YOLO格式，兼容性最好
- ✅ 适合城市街道元素检测任务
- ✅ 训练简单，模型成熟

## 📝 详细操作步骤

### 步骤1: 从Label Studio导出数据

对每个项目执行以下操作：

#### 1.1 打开项目
- 登录Label Studio
- 选择项目（例如：project-1 绿化）

#### 1.2 导出数据
1. 点击页面右上角的 **"Export"** 按钮
2. 在导出选项中选择 **"YOLO with Images"**
3. 点击 **"Export"** 开始导出
4. 等待导出完成（可能需要几分钟）

#### 1.3 下载ZIP文件
- 下载生成的ZIP文件
- 重命名为有意义的名字，例如：
  - `project-1-greenery.zip` (绿化)
  - `project-2-store.zip` (店招)
  - `project-3-sidewalk.zip` (人行道)
  - `project-4-bike.zip` (自行车道)
  - `project-5-facility.zip` (城市设施)

#### 1.4 重复步骤
- 对其他4个项目重复上述步骤
- 最终您将得到5个ZIP文件

### 步骤2: 整理导出的文件

#### 2.1 创建导出目录
```bash
# 在ai-models目录下创建导出目录
mkdir data/label_studio_exports
```

#### 2.2 移动ZIP文件
将下载的5个ZIP文件移动到 `data/label_studio_exports/` 目录：
```
data/label_studio_exports/
├── project-1-greenery.zip
├── project-2-store.zip
├── project-3-sidewalk.zip
├── project-4-bike.zip
└── project-5-facility.zip
```

### 步骤3: 自动合并数据集

使用我创建的自动化脚本：

```bash
# 运行合并脚本
python scripts/merge_yolo_exports.py --export-dir data/label_studio_exports --output-dir data/yolo_dataset
```

**脚本会自动完成**：
1. ✅ 解压所有ZIP文件
2. ✅ 查找图像和标注文件
3. ✅ 划分数据集（80%训练，10%验证，10%测试）
4. ✅ 合并所有项目的数据
5. ✅ 创建dataset.yaml配置文件
6. ✅ 生成统计信息

### 步骤4: 验证数据集

合并完成后，检查数据集：

```bash
# 查看数据集结构
ls data/yolo_dataset/

# 查看训练集图像数量
ls data/yolo_dataset/train/images/

# 查看训练集标注数量
ls data/yolo_dataset/train/labels/
```

**预期结果**：
```
data/yolo_dataset/
├── train/
│   ├── images/    # 约2000+ 张图像
│   └── labels/    # 约2000+ 个标注文件
├── val/
│   ├── images/    # 约250+ 张图像
│   └── labels/    # 约250+ 个标注文件
├── test/
│   ├── images/    # 约250+ 张图像
│   └── labels/    # 约250+ 个标注文件
└── dataset.yaml    # 数据集配置文件
```

## 🚀 开始训练

数据集准备好后，立即开始训练：

```bash
# 使用YOLOv8n（nano）模型快速训练
python scripts/train_yolov8.py --model-size n --epochs 100 --batch 16
```

## 📋 完整操作流程总结

```
1. Label Studio导出
   ├─ 项目1: 绿化 → YOLO with Images → project-1-greenery.zip
   ├─ 项目2: 店招 → YOLO with Images → project-2-store.zip
   ├─ 项目3: 人行道 → YOLO with Images → project-3-sidewalk.zip
   ├─ 项目4: 自行车道 → YOLO with Images → project-4-bike.zip
   └─ 项目5: 城市设施 → YOLO with Images → project-5-facility.zip

2. 整理文件
   └─ 移动所有ZIP文件到 data/label_studio_exports/

3. 自动合并
   └─ 运行 python scripts/merge_yolo_exports.py

4. 验证数据集
   └─ 检查数据集结构和文件数量

5. 开始训练
   └─ 运行 python scripts/train_yolov8.py
```

## 💡 提示

### 导出时的注意事项
1. **确保选择"YOLO with Images"**，这样会包含图像文件
2. **导出可能需要几分钟**，请耐心等待
3. **每个项目单独导出**，不要合并导出
4. **重命名ZIP文件**，便于识别

### 合并时的注意事项
1. **确保所有ZIP文件都在同一目录**
2. **ZIP文件名可以自定义**，但建议使用有意义的名字
3. **脚本会自动处理类别映射**，无需手动调整
4. **数据集会自动划分**，无需手动操作

### 训练前的检查清单
- [ ] 5个ZIP文件都已导出
- [ ] ZIP文件都在 data/label_studio_exports/ 目录
- [ ] 已运行 merge_yolo_exports.py 脚本
- [ ] 训练集、验证集、测试集都有图像和标注
- [ ] dataset.yaml 文件存在且正确
- [ ] GPU可用（推荐，但不是必需的）

## 🆘 常见问题

### Q1: 导出时卡住怎么办？
- 等待更长时间，大项目可能需要几分钟
- 检查网络连接
- 尝试分批导出（每次导出一个项目）

### Q2: ZIP文件损坏怎么办？
- 重新导出对应的项目
- 检查磁盘空间是否充足

### Q3: 合并脚本报错怎么办？
- 检查ZIP文件是否完整
- 检查ZIP文件是否在正确的目录
- 查看错误日志，根据提示调整

### Q4: 类别映射不正确怎么办？
- 检查每个导出文件中的 classes.txt
- 根据实际情况修改脚本中的 class_mapping
- 重新运行合并脚本

### Q5: 数据集划分不均匀怎么办？
- 脚本使用随机划分，可能不完全均匀
- 可以手动调整 train/val/test 目录中的文件
- 重新运行脚本会覆盖之前的结果

## 📞 需要帮助？

如果遇到问题，请检查：
1. Label Studio导出是否成功
2. ZIP文件是否完整
3. 脚本运行日志中的错误信息
4. 数据集目录结构是否正确

---

**祝您导出顺利！** 🎉
