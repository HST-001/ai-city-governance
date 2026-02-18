import React, { useState, useEffect } from 'react';
import { Card, Button, message, Table, Tag, Modal, Space, Progress, Select, Form, Input, Divider, Upload } from 'antd';
import { EyeOutlined, StarOutlined, DatabaseOutlined, PlayCircleOutlined, StopOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/rolePermissions';
import { trainingTaskAPI, aiModelAPI, trainingDatasetAPI } from '../services/trainingApi';

const { Option } = Select;
const { Dragger } = Upload;

// API响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 训练任务类型
interface TrainingTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  photoCount: number;
  accuracy: number;
  createdAt: string;
  completedAt: string | null;
  modelType: string;
  trainedBy: string;
}

// 模拟图片评级结果
interface RatingResult {
  id: string;
  photoUrl: string;
  modelId: string;
  modelName: string;
  rating: number;
  confidence: number;
  analyzedAt: string;
  categories: {
    shopSignBuilding: number;
    greeneryMaintenance: number;
    greeneryCoverage: number;
    sidewalkDamage: number;
    bikeLaneConnectivity: number;
    urbanFacilitiesIntegrity: number;
    urbanFacilitiesDamage: number;
    other: number;
  };
}

interface ImageTrainingProps {
  onTaskCreated?: (task: TrainingTask) => void;
}

const ImageTraining: React.FC<ImageTrainingProps> = ({ onTaskCreated }) => {
  const { user } = useAuth();
  const [trainingTasks, setTrainingTasks] = useState<TrainingTask[]>([]);
  const [ratingResults, setRatingResults] = useState<RatingResult[]>([]);
  const [isTrainingModalVisible, setIsTrainingModalVisible] = useState<boolean>(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<TrainingTask | null>(null);
  const [selectedRating, setSelectedRating] = useState<RatingResult | null>(null);
  const [trainingForm] = Form.useForm();
  const [ratingForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);

  // 权限控制：检查用户是否有训练模型的权限
  const canTrainModels = user && (user.role === Role.ADMIN || user.role === Role.CLIENT);

  useEffect(() => {
    loadTrainingTasks();
    loadAvailableDatasets();
    
    // 定时刷新训练任务列表（每5秒刷新一次）
    const interval = setInterval(() => {
      loadTrainingTasks();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTrainingTasks = async () => {
    try {
      setLoading(true);
      const response = await trainingTaskAPI.getAllTasks() as unknown as ApiResponse<any[]>;
      if (response.success && response.data && response.data.length > 0) {
        const formattedTasks = response.data.map((task: any) => ({
          id: String(task.id),
          name: task.name,
          description: task.description,
          status: task.status,
          progress: task.progress,
          photoCount: task.photoCount,
          accuracy: task.accuracy,
          createdAt: new Date(task.createdAt).toLocaleString('zh-CN'),
          completedAt: task.completedAt ? new Date(task.completedAt).toLocaleString('zh-CN') : null,
          modelType: task.modelType,
          trainedBy: String(task.trainedBy),
        }));
        setTrainingTasks(formattedTasks);
      } else {
        setTrainingTasks([]);
      }
    } catch (error) {
      console.error('加载训练任务失败:', error);
      message.error('加载训练任务失败');
      setTrainingTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDatasets = async () => {
    try {
      const response = await trainingDatasetAPI.getAvailableDatasets() as unknown as ApiResponse<any[]>;
      if (response.success) {
        setAvailableDatasets(response.data);
      }
    } catch (error) {
      console.error('加载可用数据集失败:', error);
    }
  };

  // 开始新的训练任务
  const startTraining = async (values: any) => {
    try {
      const response = await trainingTaskAPI.createTask(
        values.taskName,
        values.description,
        values.modelType,
        1,
        values.datasetId,
        values.regressionHead
      ) as unknown as ApiResponse<any>;

      if (response.success) {
        message.success('训练任务已创建');
        setIsTrainingModalVisible(false);
        trainingForm.resetFields();
        
        // 自动开始训练
        const startResponse = await trainingTaskAPI.startTraining(response.data.id) as unknown as ApiResponse<any>;
        if (startResponse.success) {
          message.success('训练任务已开始');
        }
        
        loadTrainingTasks();

        if (onTaskCreated) {
          onTaskCreated(response.data);
        }
      } else {
        message.error(response.message || '创建训练任务失败');
      }
    } catch (error) {
      console.error('创建训练任务失败:', error);
      message.error('创建训练任务失败');
    }
  };

  const rateWithModel = async (values: any) => {
    const selectedTask = trainingTasks.find(task => task.id === values.modelId);
    if (!selectedTask) {
      message.error('请选择有效的模型');
      return;
    }

    if (selectedTask.status !== 'completed') {
      message.error('只能使用已完成的训练任务进行评级');
      return;
    }

    try {
      setLoading(true);
      const response = await trainingTaskAPI.rateImage(Number(values.modelId), values.file) as unknown as ApiResponse<any>;

      if (response.success && response.data) {
        const flaskData = response.data;
        const newRating: RatingResult = {
          id: String(Date.now()),
          photoUrl: URL.createObjectURL(values.file),
          modelId: values.modelId,
          modelName: selectedTask.name,
          rating: flaskData.total_score || 0,
          confidence: flaskData.confidence || 0,
          analyzedAt: new Date().toLocaleString(),
          categories: {
            shopSignBuilding: flaskData.scores?.shop_sign_building || 0,
            greeneryMaintenance: flaskData.scores?.greenery_maintenance || 0,
            greeneryCoverage: flaskData.scores?.greenery_coverage || 0,
            sidewalkDamage: flaskData.scores?.sidewalk_damage || 0,
            bikeLaneConnectivity: flaskData.scores?.bike_lane_connectivity || 0,
            urbanFacilitiesIntegrity: flaskData.scores?.urban_facilities_integrity || 0,
            urbanFacilitiesDamage: flaskData.scores?.urban_facilities_damage || 0,
            other: flaskData.scores?.other || 0,
          },
        };

        setRatingResults([newRating, ...ratingResults]);
        setIsRatingModalVisible(false);
        ratingForm.resetFields();
        message.success('图片评级完成！');
      } else {
        message.error(response.message || '评级失败');
      }
    } catch (error) {
      console.error('评级失败:', error);
      message.error('评级失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始训练任务
  const handleStartTraining = async (taskId: string) => {
    try {
      const response = await trainingTaskAPI.startTraining(Number(taskId)) as unknown as ApiResponse<any>;
      if (response.success) {
        message.success('训练任务已开始');
        loadTrainingTasks();
      } else {
        message.error(response.message || '开始训练失败');
      }
    } catch (error) {
      console.error('开始训练失败:', error);
      message.error('开始训练失败');
    }
  };

  const handleDeleteTask = async (taskId: string, taskName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除训练任务"${taskName}"吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await trainingTaskAPI.deleteTask(Number(taskId)) as unknown as ApiResponse<any>;
          if (response.success) {
            message.success('训练任务已删除');
            loadTrainingTasks();
          } else {
            message.error(response.message || '删除训练任务失败');
          }
        } catch (error) {
          console.error('删除训练任务失败:', error);
          message.error('删除训练任务失败');
        }
      },
    });
  };

  // 获取状态标签颜色
  const getStatusTagColor = (status: TrainingTask['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'training':
        return 'processing';
      case 'failed':
        return 'error';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  // 训练任务表格列定义
  const trainingColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '模型类型',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TrainingTask['status']) => {
        const statusText = {
          pending: '待开始',
          training: '训练中',
          completed: '已完成',
          failed: '失败',
        }[status];
        
        return <Tag color={getStatusTagColor(status)}>{statusText}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: TrainingTask) => (
        <div>
          <Progress 
            percent={progress} 
            status={record.status === 'failed' ? 'exception' : record.status === 'completed' ? 'success' : 'active'}
            size="small"
          />
        </div>
      ),
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => <span>{accuracy > 0 ? `${accuracy.toFixed(1)}%` : '-'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TrainingTask) => (
        <Space>
          {canTrainModels && record.status === 'pending' && (
            <Button 
              type="link" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartTraining(record.id)}
            >
              开始训练
            </Button>
          )}
          {canTrainModels && record.status === 'training' && (
            <Button 
              type="link" 
              danger
              icon={<StopOutlined />}
              onClick={() => setSelectedTask(record)}
            >
              停止训练
            </Button>
          )}
          {canTrainModels && (
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTask(record.id, record.name)}
            >
              删除
            </Button>
          )}
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedTask(record)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  // 评级结果表格列定义
  const ratingColumns = [
    {
      title: '照片',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (url: string) => (
        <img src={url} alt="Street Sample" style={{ width: 100, height: 70 }} />
      ),
    },
    {
      title: '使用模型',
      dataIndex: 'modelName',
      key: 'modelName',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <span>{rating.toFixed(1)}</span>,
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => <span>{confidence + '%'}</span>,
    },
    {
      title: '分析时间',
      dataIndex: 'analyzedAt',
      key: 'analyzedAt',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: RatingResult) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => setSelectedRating(record)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="图片训练与评级系统">
        <div>
          <Space style={{ marginBottom: 20 }}>
            <h2>训练任务管理</h2>
            {canTrainModels && (
              <Button 
                type="primary" 
                icon={<DatabaseOutlined />}
                onClick={() => setIsTrainingModalVisible(true)}
              >
                新建训练任务
              </Button>
            )}
          </Space>
        </div>
        
        <Table 
          dataSource={trainingTasks} 
          columns={trainingColumns} 
          rowKey="id"
          loading={loading}
          style={{ marginBottom: 30 }}
        />
        
        <div>
          <Space style={{ marginBottom: 20 }}>
            <h2>评级结果</h2>
            {canTrainModels && (
              <Button 
                type="primary" 
                icon={<StarOutlined />}
                onClick={() => setIsRatingModalVisible(true)}
              >
                开始评级
              </Button>
            )}
          </Space>
        </div>
        
        <Table 
          dataSource={ratingResults} 
          columns={ratingColumns} 
          rowKey="id"
        />
      </Card>
      
      {/* 创建训练任务模态框 */}
      <Modal
        title="创建训练任务"
        open={isTrainingModalVisible}
        onCancel={() => setIsTrainingModalVisible(false)}
        footer={null}
      >
        <Form
          form={trainingForm}
          layout="vertical"
          onFinish={startTraining}
        >
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入训练任务的名称' }]}
          >
            <Input placeholder="请输入训练任务的名称" />
          </Form.Item>
          
          <Form.Item
            name="modelType"
            label="模型架构"
            rules={[{ required: true, message: '请选择模型架构' }]}
          >
            <Select placeholder="请选择模型架构">
              <Select.OptGroup label="YOLOv8 系列">
                <Option value="yolov8n">YOLOv8n (Nano - 轻量级)</Option>
                <Option value="yolov8s">YOLOv8s (Small - 小型)</Option>
                <Option value="yolov8m">YOLOv8m (Medium - 中型)</Option>
                <Option value="yolov8l">YOLOv8l (Large - 大型)</Option>
                <Option value="yolov8x">YOLOv8x (Extra Large - 超大型)</Option>
              </Select.OptGroup>
              <Select.OptGroup label="YOLOv5 系列">
                <Option value="yolov5n">YOLOv5n (Nano)</Option>
                <Option value="yolov5s">YOLOv5s (Small)</Option>
                <Option value="yolov5m">YOLOv5m (Medium)</Option>
                <Option value="yolov5l">YOLOv5l (Large)</Option>
                <Option value="yolov5x">YOLOv5x (Extra Large)</Option>
              </Select.OptGroup>
              <Select.OptGroup label="ResNet 系列">
                <Option value="resnet18">ResNet18 (经典)</Option>
                <Option value="resnet50">ResNet50 (经典)</Option>
              </Select.OptGroup>
              <Select.OptGroup label="EfficientNet 系列 (高效)">
                <Option value="efficientnet_b0">EfficientNet-B0 (超轻量)</Option>
                <Option value="efficientnet_b1">EfficientNet-B1 (轻量)</Option>
                <Option value="efficientnet_b2">EfficientNet-B2 (小型)</Option>
                <Option value="efficientnet_b3">EfficientNet-B3 (中型)</Option>
                <Option value="efficientnet_b4">EfficientNet-B4 (大型)</Option>
              </Select.OptGroup>
              <Select.OptGroup label="MobileNet 系列 (移动端)">
                <Option value="mobilenet_v2">MobileNetV2 (移动端优化)</Option>
                <Option value="mobilenet_v3">MobileNetV3 (移动端优化)</Option>
              </Select.OptGroup>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="regressionHead"
            label="回归头"
            rules={[{ required: true, message: '请选择回归头类型' }]}
            tooltip="回归头用于对检测到的对象进行评分，基于Label Studio的打分数据训练"
          >
            <Select placeholder="请选择回归头类型">
              <Option value="none">不使用回归头（仅检测）</Option>
              <Option value="basic">基础回归头（简单评分）</Option>
              <Option value="advanced">高级回归头（多维度评分）</Option>
              <Option value="ensemble">集成回归头（融合多种评分）</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="datasetId"
            label="选择训练数据集"
            rules={[{ required: true, message: '请选择训练数据集' }]}
          >
            <Select placeholder="请选择训练数据集">
              {availableDatasets.map(dataset => (
                <Option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.fileCount} 张图片)
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入训练任务的描述" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={() => setIsTrainingModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建训练任务
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 图片评级模态框 */}
      <Modal
        title="图片评级"
        open={isRatingModalVisible}
        onCancel={() => setIsRatingModalVisible(false)}
        footer={null}
      >
        <Form
          form={ratingForm}
          layout="vertical"
          onFinish={rateWithModel}
        >
          <Form.Item
            name="modelId"
            label="选择模型"
            rules={[{ required: true, message: '请选择用于评级的模型' }]}
          >
            <Select placeholder="请选择用于评级的模型">
              {trainingTasks
                .filter(task => task.status === 'completed')
                .map(task => (
                  <Option key={task.id} value={task.id}>
                    {task.name} ({task.modelType})
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          
          <Form.Item
            name="file"
            label="上传图片"
            rules={[{ required: true, message: '请上传要评级的图片' }]}
          >
            <Dragger
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件！');
                }
                return isImage || Upload.LIST_IGNORE;
              }}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG、PNG 等图片格式</p>
            </Dragger>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={() => setIsRatingModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                开始评级
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 训练任务详情模态框 */}
      <Modal
        title="训练任务详情"
        open={!!selectedTask}
        onCancel={() => setSelectedTask(null)}
        footer={null}
      >
        {selectedTask && (
          <div>
            <p><strong>任务名称:</strong> {selectedTask.name}</p>
            <p><strong>模型类型:</strong> {selectedTask.modelType}</p>
            <p><strong>描述:</strong> {selectedTask.description}</p>
            <p><strong>训练照片数量:</strong> {selectedTask.photoCount}</p>
            <p><strong>训练状态:</strong> 
              <Tag color={getStatusTagColor(selectedTask.status)}>
                {{
                  pending: '待开始',
                  training: '训练中',
                  completed: '已完成',
                  failed: '失败',
                }[selectedTask.status]}
              </Tag>
            </p>
            {selectedTask.accuracy > 0 && (
              <p><strong>准确率:</strong> {selectedTask.accuracy.toFixed(1)}%</p>
            )}
            <p><strong>创建时间:</strong> {selectedTask.createdAt}</p>
            {selectedTask.completedAt && (
              <p><strong>完成时间:</strong> {selectedTask.completedAt}</p>
            )}
            <p><strong>训练者:</strong> {selectedTask.trainedBy}</p>
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Button onClick={() => setSelectedTask(null)}>关闭</Button>
        </div>
      </Modal>
      
      {/* 评级结果详情模态框 */}
      <Modal
        title="评级结果详情"
        open={!!selectedRating}
        onCancel={() => setSelectedRating(null)}
        footer={null}
      >
        {selectedRating && (
          <div>
            <img 
              src={selectedRating.photoUrl} 
              alt="Street Sample" 
              style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
            />
            <p><strong>使用模型:</strong> {selectedRating.modelName}</p>
            <p><strong>综合评分:</strong> 
              <span style={{ color: 'blue', fontWeight: 'bold', marginLeft: 8 }}>
                {selectedRating.rating.toFixed(1)}
              </span>
            </p>
            <p><strong>置信度:</strong> {selectedRating.confidence}%</p>
            <p><strong>分析时间:</strong> {selectedRating.analyzedAt}</p>
            
            <Divider orientation="left">分类评分</Divider>
            
            <p><strong>店招/建筑美观度:</strong> {selectedRating.categories.shopSignBuilding.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.shopSignBuilding * 20} />
            
            <p style={{ marginTop: 16 }}><strong>绿化养护达标度:</strong> {selectedRating.categories.greeneryMaintenance.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.greeneryMaintenance * 20} />
            
            <p style={{ marginTop: 16 }}><strong>绿化覆盖率:</strong> {selectedRating.categories.greeneryCoverage.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.greeneryCoverage * 20} />
            
            <p style={{ marginTop: 16 }}><strong>人行道破损程度:</strong> {selectedRating.categories.sidewalkDamage.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.sidewalkDamage * 20} />
            
            <p style={{ marginTop: 16 }}><strong>自行车道连通性:</strong> {selectedRating.categories.bikeLaneConnectivity.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.bikeLaneConnectivity * 20} />
            
            <p style={{ marginTop: 16 }}><strong>城市设施/家具完善度:</strong> {selectedRating.categories.urbanFacilitiesIntegrity.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.urbanFacilitiesIntegrity * 20} />
            
            <p style={{ marginTop: 16 }}><strong>城市设施/家具破损程度:</strong> {selectedRating.categories.urbanFacilitiesDamage.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.urbanFacilitiesDamage * 20} />
            
            <p style={{ marginTop: 16 }}><strong>其他:</strong> {selectedRating.categories.other.toFixed(1)}</p>
            <Progress percent={selectedRating.categories.other * 20} />
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Button onClick={() => setSelectedRating(null)}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ImageTraining;