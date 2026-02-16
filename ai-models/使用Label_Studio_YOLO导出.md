# 使用Label Studio的YOLO导出功能

## 🎯 Label Studio YOLO导出步骤

### 步骤1: 导出YOLO格式数据

1. **登录Label Studio**
   - 打开浏览器，访问您的Label Studio地址
   - 登录您的账户

2. **进入项目**
   - 选择您要导出的项目（5个项目之一）
   - 例如：project-1（绿化）

3. **导出数据**
   - 点击页面右上角的 **"Export"** 按钮
   - 在导出选项中选择 **"YOLO"** 格式
   - 点击 **"Export"** 开始导出

4. **下载导出文件**
   - Label Studio会生成一个ZIP文件
   - 下载该ZIP文件到本地

5. **重复步骤2-4**
   - 对其他4个项目重复上述步骤
   - 您将得到5个ZIP文件

### 步骤2: 解压并整理导出文件

Label Studio导出的YOLO格式通常包含：
- `classes.txt` - 类别名称文件
- `images/` - 图像文件夹
- `labels/` - 标注文件夹

**解压步骤**：

```bash
# 创建临时目录
mkdir data/label_studio_exports
cd data/label_studio_exports

# 解压每个导出的ZIP文件
# 假设文件名为：
# - project-1-yolo.zip (绿化)
# - project-2-yolo.zip (店招)
# - project-3-yolo.zip (人行道)
# - project-4-yolo.zip (自行车道)
# - project-5-yolo.zip (城市设施)

# 使用PowerShell解压
Expand-Archive project-1-yolo.zip -DestinationPath project-1
Expand-Archive project-2-yolo.zip -DestinationPath project-2
Expand-Archive project-3-yolo.zip -DestinationPath project-3
Expand-Archive project-4-yolo.zip -DestinationPath project-4
Expand-Archive project-5-yolo.zip -DestinationPath project-5
```

### 步骤3: 合并数据集

创建一个脚本来合并所有导出的数据：