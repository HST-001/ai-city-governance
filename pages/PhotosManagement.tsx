import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message, Modal, Image, Input, Select, DatePicker } from 'antd';
import { DeleteOutlined, EyeOutlined, UploadOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { getPhotos, deletePhoto, batchDeletePhotos, Photo, PhotoQueryParams } from '../api/photo';
import { useAuth } from '../hooks/useAuth';
import ratingService from '../services/ratingService';
import { RatingRequest } from '../types/rating';

interface PhotosManagementProps {}

const PhotosManagement: React.FC<PhotosManagementProps> = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [filters, setFilters] = useState<PhotoQueryParams>({});

  // 从URL获取文件对象
  const getFileFromUrl = async (url: string, filename: string): Promise<File | null> => {
    try {
      let fileUrl = url;
      // 确保URL格式正确
      if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        // 确保添加/api前缀
        if (!fileUrl.startsWith('/api')) {
          fileUrl = `/api${fileUrl}`;
        }
        // 确保添加/uploads前缀
        if (!fileUrl.includes('/uploads')) {
          fileUrl = `/api/uploads/${filename}`;
        }
      }
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error getting file from URL:', error);
      return null;
    }
  };

  // 加载照片列表
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await getPhotos({
        ...filters,
        page: currentPage,
        size: pageSize
      });
      
      if (response.success && response.data) {
        // 适配后端数据结构，转换字段名
        const formattedPhotos = (response.data.content || []).map((photo: any) => {
          let filePath = photo.filePath || '';
          // 确保filePath格式正确，添加/api前缀和/uploads前缀
          if (filePath) {
            // 如果路径已经是完整URL，直接使用
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
              // 保持完整URL不变
            } else {
              // 确保路径以/uploads开头
              if (!filePath.startsWith('/uploads')) {
                // 提取文件名
                const fileName = filePath.split('/').pop() || '';
                filePath = `/uploads/${fileName}`;
              }
              // 确保添加/api前缀
              if (!filePath.startsWith('/api')) {
                filePath = `/api${filePath}`;
              }
            }
          }
          return {
            id: photo.id,
            fileName: photo.fileName,
            originalName: photo.fileName, // 后端没有originalName字段，使用fileName代替
            province: photo.province || '', // 后端可能没有province字段
            city: photo.city || '',
            district: photo.district || '',
            street: photo.streetName || '', // 后端返回streetName，前端期望street
            type: '', // 后端没有type字段
            status: photo.analyzed ? '已分析' : '未分析', // 后端返回analyzed字段
            uploadTime: photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleString() : '', // 后端返回uploadedAt
            analyzeTime: photo.lastAnalyzedAt ? new Date(photo.lastAnalyzedAt).toLocaleString() : '', // 后端返回lastAnalyzedAt
            userId: photo.uploadedBy || 0, // 后端返回uploadedBy
            username: '', // 后端没有username字段
            score: photo.rating || 0, // 后端返回rating，前端期望score
            filePath: filePath
          };
        });
        setPhotos(formattedPhotos);
        setTotal(response.data.totalElements || 0);
      } else {
        setPhotos([]);
        setTotal(0);
        message.error('加载照片失败');
      }
    } catch (error) {
      console.error('加载照片失败:', error);
      message.error('加载照片失败');
      setPhotos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadPhotos();
  }, [currentPage, pageSize, filters]);

  // 处理分页变化
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理照片选择
  const handlePhotoSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedPhotos(selectedRowKeys.map(key => Number(key)));
  };

  // 处理照片删除
  const handleDeletePhoto = async (id: number) => {
    try {
      const response = await deletePhoto(id);
      if (response.success) {
        message.success('照片删除成功');
        loadPhotos();
      } else {
        message.error('照片删除失败');
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      message.error('删除照片失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedPhotos.length === 0) {
      message.warning('请选择要删除的照片');
      return;
    }

    try {
      const response = await batchDeletePhotos(selectedPhotos);
      if (response.success) {
        message.success('批量删除成功');
        setSelectedPhotos([]);
        loadPhotos();
      } else {
        message.error('批量删除失败');
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败');
    }
  };

  // 处理照片预览
  const handlePreview = (filePath: string) => {
    setPreviewImage(filePath);
    setPreviewVisible(true);
  };

  // 处理筛选条件变化
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // 重置到第一页
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // 处理AI评分
  const handleAiRating = async (photo: Photo) => {
    try {
      setRatingLoading(photo.id);
      
      // 从URL获取文件对象
      const file = await getFileFromUrl(photo.filePath || '', photo.fileName);
      if (!file) {
        message.error('照片文件获取失败，请检查文件是否存在');
        return;
      }
      
      // 构建评分请求参数
      const ratingRequest: RatingRequest = {
        photoId: String(photo.id),
        userId: String(user?.id || 0)
      };
      
      // 调用评分服务
      const result = await ratingService.ratePhoto(ratingRequest, file);
      
      // 更新照片评分
      setPhotos(prevPhotos => 
        prevPhotos.map(p => 
          p.id === photo.id ? { ...p, score: result.overallScore } : p
        )
      );
      
      message.success('AI评分成功');
    } catch (error) {
      console.error('AI评分失败:', error);
      message.error('AI评分失败，请稍后重试');
    } finally {
      setRatingLoading(null);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '照片',
      dataIndex: 'filePath',
      key: 'filePath',
      render: (filePath: string) => {
        // 修复图片URL，添加/api前缀
        const imageUrl = filePath.startsWith('/api') ? filePath : `/api${filePath}`;
        return (
          <div>
            <Image
              width={80}
              height={60}
              src={imageUrl}
              alt="照片"
              preview={false}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePreview(imageUrl)}
            />
          </div>
        );
      },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '原始文件名',
      dataIndex: 'originalName',
      key: 'originalName',
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '县区',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '街道',
      dataIndex: 'street',
      key: 'street',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => score || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Photo) => (
              <Space>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(record.filePath || '')}
                >
                  预览
                </Button>
                <Button
                  type="link"
                  icon={<StarOutlined />}
                  loading={ratingLoading === record.id}
                  onClick={() => handleAiRating(record)}
                >
                  AI评分
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeletePhoto(record.id)}
                >
                  删除
                </Button>
              </Space>
            ),
    },
  ];

  return (
    <div className="photos-management-container">
      <Card title="照片管理">
        {/* 筛选条件 */}
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Space wrap>
            <Input
              placeholder="关键词搜索"
              style={{ width: 200 }}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
            <Select
              placeholder="省份"
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('province', value)}
            >
              {/* 省份选项可从API获取 */}
            </Select>
            <Select
              placeholder="城市"
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('city', value)}
            >
              {/* 城市选项可从API获取 */}
            </Select>
            <Select
              placeholder="类型"
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('type', value)}
            >
              {/* 类型选项可从API获取 */}
            </Select>
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              {/* 状态选项可从API获取 */}
            </Select>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={loadPhotos}
            >
              搜索
            </Button>
            <Button onClick={handleResetFilters}>
              重置
            </Button>
          </Space>
        </div>

        {/* 批量操作 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
            >
              上传照片
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedPhotos.length === 0}
            >
              批量删除
            </Button>
          </Space>
        </div>

        {/* 照片列表 */}
        <Table
          columns={columns}
          dataSource={photos}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          rowSelection={{
            selectedRowKeys: selectedPhotos,
            onChange: handlePhotoSelect,
          }}
        />

        {/* 照片预览模态框 */}
        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width={800}
        >
          <Image
            width="100%"
            src={previewImage}
            alt="照片预览"
          />
        </Modal>
      </Card>
    </div>
  );
};

export default PhotosManagement;