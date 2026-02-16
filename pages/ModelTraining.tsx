import React, { useState, useEffect } from 'react';
import { Tabs, Row, Col, Card, Button, message, Table, Tag, Space, Alert, Badge, Modal, Form, Input, Select, Upload, Progress, Checkbox } from 'antd';
import { DatabaseOutlined, FileTextOutlined, CodeOutlined, LockOutlined, PlusOutlined, EditOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/rolePermissions';
import ImageTraining from '../components/ImageTraining';
import { ProtectedRoute } from '../components/ProtectedRoute';
import type { UploadProps } from 'antd';
import { aiModelAPI, trainingDatasetAPI } from '../services/trainingApi';

const { TabPane } = Tabs;
const { Option } = Select;

// API响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 模型定义
interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  status: 'active' | 'inactive';
  accuracy: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  trainingDataSize: string;
  isProduction: boolean;
}

// 训练数据定义
interface TrainingData {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'available' | 'processing' | 'deprecated';
  usedInModels: string[];
}

const ModelTraining: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadDataModalVisible, setUploadDataModalVisible] = useState(false);
  const [viewDataModalVisible, setViewDataModalVisible] = useState(false);
  const [viewDataEditMode, setViewDataEditMode] = useState(false);
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [showAddFilesSection, setShowAddFilesSection] = useState(false);
  const [datasetFiles, setDatasetFiles] = useState<string[]>([]);
  const [selectedTrainingData, setSelectedTrainingData] = useState<TrainingData | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [form] = Form.useForm();
  const [uploadDataForm] = Form.useForm();
  const [viewDataForm] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [addFiles, setAddFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const canTrainModels = user?.role === Role.ADMIN || user?.role === Role.DEVELOPER;
  const canConfigureModels = user?.role === Role.ADMIN;
  const isClientUser = user?.role === Role.CLIENT;

  useEffect(() => {
    loadModels();
    loadTrainingData();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await aiModelAPI.getAllModels() as unknown as ApiResponse<any[]>;
      if (response.success && response.data && response.data.length > 0) {
        const formattedModels = response.data.map((model: any) => ({
          id: String(model.id),
          name: model.name,
          type: model.type,
          description: model.description,
          version: model.version,
          status: model.status,
          accuracy: model.accuracy,
          createdAt: new Date(model.createdAt).toLocaleString('zh-CN'),
          updatedAt: new Date(model.updatedAt).toLocaleString('zh-CN'),
          createdBy: String(model.createdBy),
          trainingDataSize: model.trainingDataSize || '0MB',
          isProduction: model.isProduction,
        }));
        setModels(formattedModels);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('加载模型列表失败:', error);
      message.error('加载模型列表失败');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      const response = await trainingDatasetAPI.getAllDatasets() as unknown as ApiResponse<any[]>;
      if (response.success) {
        const formattedData = response.data.map((dataset: any) => ({
          id: String(dataset.id),
          name: dataset.name,
          description: dataset.description,
          fileCount: dataset.fileCount,
          fileSize: dataset.fileSize,
          uploadedAt: new Date(dataset.uploadedAt).toLocaleString('zh-CN'),
          uploadedBy: String(dataset.uploadedBy),
          status: dataset.status,
          usedInModels: [],
        }));
        setTrainingData(formattedData);
      }
    } catch (error) {
      console.error('加载训练数据失败:', error);
      message.error('加载训练数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 查看模型详情
  const handleViewModel = (model: Model) => {
    setSelectedModel(model);
    setViewModalVisible(true);
  };
  
  // 编辑模型
  const handleEditModel = (model: Model) => {
    setSelectedModel(model);
    form.setFieldsValue({
      name: model.name,
      type: model.type,
      description: model.description,
      version: model.version,
    });
    setEditModalVisible(true);
  };
  
  // 提交编辑模型
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModels(models.map(m => 
        m.id === selectedModel?.id ? { ...m, ...values, updatedAt: new Date().toLocaleString('zh-CN') } : m
      ));
      setEditModalVisible(false);
      message.success('模型更新成功');
    } catch (error) {
      console.error('更新模型失败:', error);
    }
  };
  
  // 打开上传数据集弹窗
  const handleUploadData = () => {
    uploadDataForm.resetFields();
    setUploadedFiles([]);
    setUploadProgress(0);
    setUploadDataModalVisible(true);
  };
  
  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,.json,.txt,.zip,.rar,.7z,.tar,.gz',
    customRequest: ({ onSuccess, onError }) => {
      // 禁用自动上传，因为我们通过handleUploadDataSubmit手动上传
      onSuccess({}, null);
    },
    beforeUpload: (file) => {
      const fileName = file.name.toLowerCase();
      const isImage = file.type.startsWith('image/');
      const isJson = fileName.endsWith('.json');
      const isTxt = fileName.endsWith('.txt');
      const isZip = fileName.endsWith('.zip');
      const isRar = fileName.endsWith('.rar');
      const is7z = fileName.endsWith('.7z');
      const isTar = fileName.endsWith('.tar');
      const isGz = fileName.endsWith('.gz');
      
      if (!isImage && !isJson && !isTxt && !isZip && !isRar && !is7z && !isTar && !isGz) {
        message.error('只能上传图片文件、标注文件或压缩包！');
        return false;
      }
      
      const isLt500M = file.size / 1024 / 1024 < 500;
      if (!isLt500M) {
        message.error('文件大小不能超过500MB！');
        return false;
      }
      return true;
    },
    onChange: (info) => {
      setUploadedFiles(info.fileList);
    },
    onRemove: (file) => {
      setUploadedFiles(uploadedFiles.filter(item => item.uid !== file.uid));
    },
  };
  
  // 提交上传数据集
  const handleUploadDataSubmit = async () => {
    try {
      console.log('===== 开始上传数据集 =====');
      console.log('uploadedFiles:', uploadedFiles);
      console.log('uploadedFiles.length:', uploadedFiles.length);
      
      const values = await uploadDataForm.validateFields();
      console.log('表单值:', values);

      if (uploadedFiles.length === 0) {
        message.error('请至少上传一个文件');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const files = uploadedFiles.map((file: any) => file.originFileObj || file);
      console.log('准备上传的文件:', files);
      console.log('文件数量:', files.length);

      const response = await trainingDatasetAPI.createDataset(
        values.name,
        values.description,
        files,
        1
      ) as unknown as ApiResponse<any>;

      console.log('上传响应:', response);

      if (response.success) {
        message.success('数据集上传成功');
        setUploadDataModalVisible(false);
        setUploadedFiles([]);
        uploadDataForm.resetFields();
        loadTrainingData();
      } else {
        console.error('上传失败，响应:', response);
        message.error(response.message || '数据集上传失败');
      }
    } catch (error) {
      console.error('上传数据集异常:', error);
      message.error('上传数据集失败');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // 查看训练数据集详情
  const handleViewTrainingData = (data: TrainingData) => {
    setSelectedTrainingData(data);
    viewDataForm.setFieldsValue({
      name: data.name,
      description: data.description,
    });
    setViewDataEditMode(false);
    setViewDataModalVisible(true);
  };
  
  // 使用训练数据集
  const handleUseTrainingData = (data: TrainingData) => {
    message.success(`已选择使用数据集：${data.name}`);
    // 这里可以添加实际的使用逻辑，比如跳转到创建训练任务页面
  };

  // 提交编辑数据集
  const handleViewDataSubmit = async () => {
    try {
      const values = await viewDataForm.validateFields();
      setLoading(true);
      const response = await trainingDatasetAPI.updateDataset(
        parseInt(selectedTrainingData?.id || '0'),
        values.name,
        values.description
      ) as unknown as ApiResponse<any>;
      if (response.success) {
        message.success('数据集更新成功');
        setViewDataEditMode(false);
        setViewDataModalVisible(false);
        loadTrainingData();
      } else {
        message.error(response.message || '数据集更新失败');
      }
    } catch (error) {
      console.error('更新数据集失败:', error);
      message.error('更新数据集失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除训练数据集
  const handleDeleteTrainingData = async (data: TrainingData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除数据集"${data.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await trainingDatasetAPI.deleteDataset(parseInt(data.id)) as unknown as ApiResponse<any>;
          if (response.success) {
            message.success('数据集删除成功');
            loadTrainingData();
          } else {
            message.error(response.message || '数据集删除失败');
          }
        } catch (error) {
          console.error('删除数据集失败:', error);
          message.error('删除数据集失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 查看数据集文件
  const handleViewFiles = async (data: TrainingData) => {
    try {
      setLoading(true);
      setSelectedTrainingData(data);
      const response = await trainingDatasetAPI.getDatasetFiles(parseInt(data.id)) as unknown as ApiResponse<any[]>;
      if (response.success) {
        setDatasetFiles(response.data || []);
        setSelectedFiles([]);
        setViewFilesModalVisible(true);
      } else {
        message.error(response.message || '获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除选中的文件
  const handleDeleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      message.error('请至少选择一个文件');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await trainingDatasetAPI.removeFilesFromDataset(
            parseInt(selectedTrainingData?.id || '0'),
            selectedFiles
          ) as unknown as ApiResponse<any>;
          if (response.success) {
            message.success('文件删除成功');
            setSelectedFiles([]);
            handleViewFiles(selectedTrainingData!);
            loadTrainingData();
          } else {
            message.error(response.message || '文件删除失败');
          }
        } catch (error) {
          console.error('删除文件失败:', error);
          message.error('删除文件失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 上传文件到数据集
  const handleUploadFiles = async () => {
    if (addFiles.length === 0) {
      message.error('请至少选择一个文件');
      return;
    }

    try {
      setIsUploading(true);
      const files = addFiles.map((file: any) => file.originFileObj || file);
      const response = await trainingDatasetAPI.addFilesToDataset(
        parseInt(selectedTrainingData?.id || '0'),
        files
      ) as unknown as ApiResponse<any>;

      if (response.success) {
        message.success('文件上传成功');
        setAddFiles([]);
        setShowAddFilesSection(false);
        handleViewFiles(selectedTrainingData!);
        loadTrainingData();
      } else {
        message.error(response.message || '文件上传失败');
      }
    } catch (error: any) {
      console.error('上传文件失败:', error);
      message.error(`文件上传失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // 设为生产模型
  const handleSetProductionModel = async (model: Model) => {
    try {
      setLoading(true);
      const response = await aiModelAPI.setProductionModel(parseInt(model.id)) as unknown as ApiResponse<any>;
      if (response.success) {
        message.success('模型已设置为生产环境');
        loadModels();
      } else {
        message.error(response.message || '设置生产模型失败');
      }
    } catch (error) {
      console.error('设置生产模型失败:', error);
      message.error('设置生产模型失败');
    } finally {
      setLoading(false);
    }
  };

  // 模型表格列定义
  const modelColumns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Model) => (
        <Space>
          {text}
          {record.isProduction && (
            <Badge color="green" text="生产" />
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Model['status']) => (
        <Tag color={status === 'active' ? 'green' : 'gray'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => `${accuracy.toFixed(1)}%`,
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Model) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewModel(record)}
          >
            查看
          </Button>
          {canConfigureModels && !record.isProduction && record.status === 'active' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleSetProductionModel(record)}
            >
              设为生产模型
            </Button>
          )}
          {canConfigureModels && (
            <Button 
              size="small" 
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除模型"${record.name}"吗？此操作不可恢复。`,
                  okText: '确定',
                  cancelText: '取消',
                  onOk: async () => {
                    try {
                      setLoading(true);
                      const response = await aiModelAPI.deleteModel(parseInt(record.id)) as unknown as ApiResponse<any>;
                      if (response.success) {
                        message.success('模型删除成功');
                        loadModels();
                      } else {
                        message.error(response.message || '模型删除失败');
                      }
                    } catch (error) {
                      console.error('删除模型失败:', error);
                      message.error('删除模型失败');
                    } finally {
                      setLoading(false);
                    }
                  },
                });
              }}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  // 训练数据表格列定义
  const trainingDataColumns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文件数量',
      dataIndex: 'fileCount',
      key: 'fileCount',
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TrainingData['status']) => {
        const statusConfig = {
          available: { text: '可用', color: 'green' },
          processing: { text: '处理中', color: 'blue' },
          deprecated: { text: '已废弃', color: 'gray' },
        };
        
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '使用情况',
      key: 'usedInModels',
      render: (_, record: TrainingData) => (
        <Tag color="default">
          用于 {record.usedInModels.length} 个模型
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TrainingData) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewTrainingData(record)}
          >
            详情
          </Button>
          <Button 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => handleViewFiles(record)}
          >
            编辑
          </Button>
          {canTrainModels && (
            <>
              <Button 
                size="small" 
                danger
                onClick={() => handleDeleteTrainingData(record)}
              >
                删除
              </Button>
              {record.status === 'available' && (
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => handleUseTrainingData(record)}
                >
                  使用
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];
  
  // 处理训练任务创建回调
  const handleTaskCreated = () => {
    message.success('新的训练任务已创建');
    // 这里可以添加刷新逻辑
  };
  
  // 渲染权限提示信息
  const renderPermissionAlert = () => {
    if (isClientUser) {
      return (
        <Alert
          message="权限说明"
          description="作为客户端用户，您只能查看模型和训练结果，无法创建或修改模型。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (user?.role === Role.DEVELOPER) {
      return (
        <Alert
          message="权限说明"
          description="作为开发人员，您可以创建和训练模型，但无法修改生产环境配置。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    return null;
  };
  
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DEVELOPER, Role.CLIENT]}>
      <div className="model-training-container">
        <h1>AI训练系统</h1>
        
        {renderPermissionAlert()}
        
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><FileTextOutlined /> 模型管理</span>} key="1">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="模型列表">
                  {isClientUser && (
                    <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      <LockOutlined /> 客户端用户只能查看模型，无法修改
                    </div>
                  )}
                  <Table 
                    columns={modelColumns} 
                    dataSource={models} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab={<span><CodeOutlined /> 图片训练与评级</span>} key="2">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                {canTrainModels ? (
                  <Card title="图片训练和评级系统">
                    <ImageTraining onTaskCreated={handleTaskCreated} />
                  </Card>
                ) : (
                  <Card title="图片训练和评级系统">
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Alert
                        message="权限不足"
                        description="您的用户角色没有权限使用训练和评级功能。只有管理员和开发人员可以训练模型和进行图片评级。"
                        type="error"
                        showIcon
                      />
                    </div>
                  </Card>
                )}
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab={<span><DatabaseOutlined /> 训练数据管理</span>} key="3">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="训练数据集" extra={canTrainModels ? <Button type="primary" icon={<PlusOutlined />} onClick={handleUploadData}>上传数据集</Button> : null}>
                  <Table 
                    columns={trainingDataColumns} 
                    dataSource={trainingData} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        
        {/* 查看模型详情Modal */}
        <Modal
          title="模型详情"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={600}
        >
          {selectedModel && (
            <div>
              <p><strong>模型名称：</strong>{selectedModel.name}</p>
              <p><strong>模型类型：</strong>{selectedModel.type}</p>
              <p><strong>版本：</strong>{selectedModel.version}</p>
              <p><strong>描述：</strong>{selectedModel.description}</p>
              <p><strong>状态：</strong>
                <Tag color={selectedModel.status === 'active' ? 'green' : 'gray'}>
                  {selectedModel.status === 'active' ? '启用' : '停用'}
                </Tag>
              </p>
              <p><strong>准确率：</strong>{selectedModel.accuracy.toFixed(1)}%</p>
              <p><strong>创建时间：</strong>{selectedModel.createdAt}</p>
              <p><strong>更新时间：</strong>{selectedModel.updatedAt}</p>
              <p><strong>创建者：</strong>{selectedModel.createdBy}</p>
              <p><strong>训练数据大小：</strong>{selectedModel.trainingDataSize}</p>
              <p><strong>是否生产环境：</strong>
                {selectedModel.isProduction ? (
                  <Tag color="green">是</Tag>
                ) : (
                  <Tag color="default">否</Tag>
                )}
              </p>
            </div>
          )}
        </Modal>
        
        {/* 编辑模型Modal */}
        <Modal
          title="编辑模型"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={handleEditSubmit}
          okText="保存"
          cancelText="取消"
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="模型名称"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              name="type"
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
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入模型描述' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入模型描述" />
            </Form.Item>
            <Form.Item
              name="version"
              label="版本"
              rules={[{ required: true, message: '请输入版本号' }]}
            >
              <Input placeholder="请输入版本号" />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* 上传数据集Modal */}
        <Modal
          title="上传训练数据集"
          open={uploadDataModalVisible}
          onCancel={() => setUploadDataModalVisible(false)}
          onOk={handleUploadDataSubmit}
          okText="上传"
          cancelText="取消"
          width={600}
          okButtonProps={{ loading: isUploading, disabled: isUploading }}
        >
          <Form form={uploadDataForm} layout="vertical">
            <Form.Item
              name="name"
              label="数据集名称"
              rules={[{ required: true, message: '请输入数据集名称' }]}
            >
              <Input placeholder="请输入数据集名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入数据集描述' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入数据集描述" />
            </Form.Item>
            <Form.Item
              label="上传训练文件"
              required
            >
              <Upload.Dragger {...uploadProps} disabled={isUploading}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个或批量上传。可上传图片文件、标注文件（JSON/TXT）或压缩包（ZIP/RAR/7Z/TAR/GZ）。压缩包会自动解压。严禁上传公司数据或其他带有版权的文件
                </p>
              </Upload.Dragger>
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p>已选择 {uploadedFiles.length} 个文件</p>
                  {uploadedFiles.map(file => (
                    <div key={file.uid} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ flex: 1 }}>{file.name}</span>
                      <span style={{ color: '#999', marginLeft: 10 }}>
                        {file.size ? ((file.size / 1024 / 1024).toFixed(2) + ' MB') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>
            {isUploading && (
              <div style={{ marginTop: 16 }}>
                <p>上传进度:</p>
                <Progress percent={uploadProgress} />
              </div>
            )}
          </Form>
        </Modal>
        
        {/* 查看训练数据集详情Modal */}
        <Modal
          title={viewDataEditMode ? "编辑训练数据集" : "训练数据集详情"}
          open={viewDataModalVisible}
          onCancel={() => {
            setViewDataEditMode(false);
            setViewDataModalVisible(false);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => {
                setViewDataEditMode(false);
                setViewDataModalVisible(false);
              }}
            >
              {viewDataEditMode ? "取消" : "关闭"}
            </Button>,
            !viewDataEditMode && canTrainModels && (
              <Button 
                key="edit" 
                type="primary"
                onClick={() => setViewDataEditMode(true)}
              >
                编辑
              </Button>
            ),
            viewDataEditMode && canTrainModels && (
              <Button 
                key="save" 
                type="primary"
                onClick={handleViewDataSubmit}
                loading={loading}
              >
                保存
              </Button>
            ),
          ]}
          width={600}
        >
          {selectedTrainingData && (
            <div>
              {viewDataEditMode ? (
                <Form form={viewDataForm} layout="vertical">
                  <Form.Item
                    name="name"
                    label="数据集名称"
                    rules={[{ required: true, message: '请输入数据集名称' }]}
                  >
                    <Input placeholder="请输入数据集名称" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="描述"
                    rules={[{ required: true, message: '请输入数据集描述' }]}
                  >
                    <Input.TextArea rows={4} placeholder="请输入数据集描述" />
                  </Form.Item>
                </Form>
              ) : (
                <div>
                  <p><strong>数据集名称：</strong>{selectedTrainingData.name}</p>
                  <p><strong>描述：</strong>{selectedTrainingData.description}</p>
                  <p><strong>文件数量：</strong>{selectedTrainingData.fileCount}</p>
                  <p><strong>文件大小：</strong>{selectedTrainingData.fileSize}</p>
                  <p><strong>上传时间：</strong>{selectedTrainingData.uploadedAt}</p>
                  <p><strong>上传者：</strong>{selectedTrainingData.uploadedBy}</p>
                  <p><strong>状态：</strong>
                    <Tag color={
                      selectedTrainingData.status === 'available' ? 'green' :
                      selectedTrainingData.status === 'processing' ? 'blue' : 'gray'
                    }>
                      {selectedTrainingData.status === 'available' ? '可用' :
                       selectedTrainingData.status === 'processing' ? '处理中' : '已废弃'}
                    </Tag>
                  </p>
                  <p><strong>使用情况：</strong>用于 {selectedTrainingData.usedInModels.length} 个模型</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* 查看数据集文件Modal */}
        <Modal
          title={`数据集"${selectedTrainingData?.name}"的文件`}
          open={viewFilesModalVisible}
          onCancel={() => setViewFilesModalVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setViewFilesModalVisible(false)}>
              关闭
            </Button>,
            canTrainModels && selectedFiles.length > 0 && (
              <Button 
                key="delete" 
                danger 
                onClick={handleDeleteSelectedFiles}
                loading={loading}
              >
                删除选中的文件 ({selectedFiles.length})
              </Button>
            ),
            canTrainModels && (
              <Button 
                key="add" 
                type="primary"
                onClick={() => setShowAddFilesSection(!showAddFilesSection)}
              >
                {showAddFilesSection ? '收起添加文件' : '添加文件'}
              </Button>
            ),
          ]}
        >
          <div>
            <Alert
              message="操作提示"
              description={
                <div>
                  <p>勾选文件后点击'删除选中的文件'按钮可批量删除</p>
                  {canTrainModels && !showAddFilesSection && (
                    <p style={{ marginTop: 8, color: '#1890ff', fontWeight: 'bold' }}>
                      点击底部的"添加文件"按钮可上传新文件到数据集
                    </p>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            {showAddFilesSection && (
              <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <h4 style={{ marginTop: 0 }}>添加文件到数据集</h4>
                <Upload.Dragger
                  multiple
                  fileList={addFiles}
                  beforeUpload={(file) => {
                    const fileName = file.name.toLowerCase();
                    const isImage = file.type.startsWith('image/');
                    const isJson = fileName.endsWith('.json');
                    const isTxt = fileName.endsWith('.txt');
                    const isZip = fileName.endsWith('.zip');
                    const isRar = fileName.endsWith('.rar');
                    const is7z = fileName.endsWith('.7z');
                    const isTar = fileName.endsWith('.tar');
                    const isGz = fileName.endsWith('.gz');
                    
                    if (!isImage && !isJson && !isTxt && !isZip && !isRar && !is7z && !isTar && !isGz) {
                      message.error('只能上传图片文件、标注文件或压缩包！');
                      return false;
                    }
                    
                    const isLt500M = file.size / 1024 / 1024 < 500;
                    if (!isLt500M) {
                      message.error('文件大小不能超过500MB！');
                      return false;
                    }
                    
                    return true;
                  }}
                  onChange={(info) => {
                    setAddFiles(info.fileList);
                  }}
                  onRemove={(file) => {
                    setAddFiles(addFiles.filter(item => item.uid !== file.uid));
                  }}
                  disabled={isUploading}
                  customRequest={({ onSuccess }) => {
                    onSuccess?.(new Date().getTime());
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持单个或批量上传。可上传图片文件、标注文件（JSON/TXT）或压缩包（ZIP/RAR/7Z/TAR/GZ）。压缩包会自动解压。严禁上传公司数据或其他带有版权的文件
                  </p>
                </Upload.Dragger>
                {addFiles.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p>已选择 {addFiles.length} 个文件</p>
                    {addFiles.map(file => (
                      <div key={file.uid} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ flex: 1 }}>{file.name}</span>
                        <span style={{ color: '#999', marginLeft: 10 }}>
                          {file.size ? ((file.size / 1024 / 1024).toFixed(2) + ' MB') : ''}
                        </span>
                      </div>
                    ))}
                    <Button
                      type="primary"
                      onClick={handleUploadFiles}
                      loading={isUploading}
                      style={{ marginTop: 16 }}
                    >
                      确认上传 ({addFiles.length} 个文件)
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Table
              dataSource={datasetFiles.map((fileName, index) => ({
                key: index,
                fileName: fileName,
              }))}
              columns={[
                {
                  title: (
                    <Checkbox
                      checked={selectedFiles.length === datasetFiles.length && datasetFiles.length > 0}
                      indeterminate={selectedFiles.length > 0 && selectedFiles.length < datasetFiles.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...datasetFiles]);
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    >
                      全选
                    </Checkbox>
                  ),
                  dataIndex: 'selected',
                  key: 'selected',
                  width: 60,
                  render: (_, record: any) => (
                    <Checkbox
                      checked={selectedFiles.includes(record.fileName)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, record.fileName]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(f => f !== record.fileName));
                        }
                      }}
                    />
                  ),
                },
                {
                  title: '文件名',
                  dataIndex: 'fileName',
                  key: 'fileName',
                },
              ]}
              rowSelection={undefined}
              pagination={{
                pageSize: 10,
              }}
            />
            {datasetFiles.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无文件
              </div>
            )}
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default ModelTraining;