# YOLOv8n 训练系统使用指南

## ✅ 训练已成功启动！

### 📊 当前训练状态
- **模型**: YOLOv8n
- **训练轮数**: 50 epochs
- **批次大小**: 8
- **图像尺寸**: 416x416
- **设备**: CPU
- **数据集**: 709张训练图像，152张验证图像
- **当前进度**: 第1个epoch，约60%完成
- **训练速度**: 约5.4秒/iteration

### 🎯 训练特性
✅ **后台运行** - 训练在后台持续运行，即使终端关闭也不会停止
✅ **自动保存** - 每个epoch完成后自动保存检查点
✅ **训练恢复** - 意外停止后可以从中断的进度继续训练
✅ **实时监控** - 可以随时查看训练进度

### 📁 重要文件位置

#### 训练日志
- **文件**: `training_background.log`
- **位置**: `c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models\training_background.log`
- **用途**: 记录完整的训练过程和输出

#### 检查点文件
- **目录**: `runs/detect/background_train_20260130_221353/`
- **文件**: 
  - `best.pt` - 最佳模型（验证集上表现最好的）
  - `last.pt` - 最新模型（最后一个epoch的）
  - `epoch*.pt` - 每个epoch的检查点

#### 训练结果
- **目录**: `runs/detect/background_train_20260130_221353/`
- **内容**: 
  - `args.yaml` - 训练参数
  - `labels.jpg` - 标签可视化
  - `train_batch*.jpg` - 训练批次可视化

### 🔧 常用命令

#### 1. 查看训练进度
```bash
cd "c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models"
python check_progress.py
```

#### 2. 持续监控训练（每10秒刷新）
```bash
cd "c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models"
python check_progress.py --continuous
```

#### 3. 查看完整训练日志
```bash
cd "c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models"
type training_background.log
```

#### 4. 查看最后50行日志
```bash
cd "c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models"
Get-Content training_background.log | Select-Object -Last 50
```

#### 5. 重新启动训练（如果意外停止）
```bash
cd "c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\ai-models"
python train_background.py
```

### 🔄 训练恢复机制

如果训练意外停止（如电脑故障、断电等），系统会自动：

1. **保存检查点** - 每个epoch完成后自动保存
2. **恢复训练** - 下次启动时自动从最新的检查点继续
3. **保留进度** - 不会丢失已完成的训练进度

### 📈 预计训练时间

根据当前速度（约5.4秒/iteration）：
- **每个epoch**: 约8-10分钟
- **50个epochs**: 约6.5-8.5小时
- **实际时间**: 可能因数据增强、验证等因素略有变化

### ⚠️ 注意事项

1. **不要手动停止训练** - 除非必要，否则让训练自然完成
2. **定期检查进度** - 使用 `check_progress.py` 查看训练状态
3. **保持电脑运行** - 确保电脑不会自动休眠或关机
4. **磁盘空间** - 确保有足够的磁盘空间保存检查点（约100-200MB）

### 🎉 训练完成后

训练完成后，您将获得：

1. **最佳模型** (`best.pt`) - 在验证集上表现最好的模型
2. **最新模型** (`last.pt`) - 最后一个epoch的模型
3. **训练曲线** - 损失函数和指标的变化趋势
4. **可视化结果** - 标签和训练批次的可视化

### 📞 问题排查

#### 训练停止了怎么办？
1. 检查电脑是否休眠或关机
2. 检查磁盘空间是否充足
3. 重新运行 `python train_background.py`，训练会自动恢复

#### 如何确认训练是否在运行？
1. 运行 `python check_progress.py` 查看进度
2. 检查 `training_background.log` 是否有新内容
3. 查看任务管理器中是否有Python进程

#### 训练速度太慢怎么办？
- 这是正常的，因为使用的是CPU训练
- GPU训练会快10-50倍，但需要支持CUDA的显卡

### 📝 训练参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| epochs | 50 | 训练轮数 |
| batch | 8 | 批次大小 |
| imgsz | 416 | 图像尺寸 |
| workers | 2 | 数据加载线程数 |
| device | cpu | 使用CPU训练 |
| optimizer | SGD | 优化器 |
| lr0 | 0.01 | 初始学习率 |
| patience | 10 | 早停耐心值 |
| save_period | 1 | 每个epoch保存一次 |

### 🚀 开始使用

训练完成后，您可以使用训练好的模型进行街道评分：

```python
from ultralytics import YOLO

# 加载最佳模型
model = YOLO('runs/detect/background_train_20260130_221353/best.pt')

# 进行预测
results = model('street_image.jpg')

# 查看结果
for result in results:
    result.show()
```

---

**祝训练顺利！** 🎉
