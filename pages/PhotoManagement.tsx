import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Space, Tag, Tooltip, Modal, message, Select, DatePicker, Spin, Table } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/rolePermissions';
import { Slider } from 'antd';
import { api } from '../services/api';
import { deletePhoto } from '../api/photo';
import { scoreImage } from '../api/ai';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PhotoManagement: React.FC = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [isAiScoring, setIsAiScoring] = useState(false);
  const [aiScoreResult, setAiScoreResult] = useState<any>(null);
  const [aiScoringIds, setAiScoringIds] = useState<Set<string>>(new Set());
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const typeOptions = [
    { value: 'shop_sign_building', label: '店招/建筑' },
    { value: 'greenery', label: '绿化' },
    { value: 'sidewalk', label: '人行道' },
    { value: 'bike_lane', label: '自行车道' },
    { value: 'urban_facilities', label: '城市设施/家具' },
    { value: 'other', label: '综合' },
  ];

  // 从后端获取照片列表
  useEffect(() => {
    fetchPhotos();
    // 定期刷新照片列表，确保数据同步
    const interval = setInterval(fetchPhotos, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const result = await api.getPhotos(1, 100);
      if (result.success && result.data) {
        const formattedPhotos = result.data.map((photo: any) => {
          const typeLabels: { [key: string]: string } = {
            'shop_sign_building': '店招/建筑',
            'greenery': '绿化',
            'sidewalk': '人行道',
            'bike_lane': '自行车道',
            'urban_facilities': '城市设施/家具',
            'other': '综合',
          };
          
          // 确保URL格式正确
          let url = photo.filePath || '';
          if (url) {
            // 如果路径已经是完整URL，直接使用
            if (url.startsWith('http://') || url.startsWith('https://')) {
              // 保持完整URL不变
            } else {
              // 确保路径以/uploads开头
              if (!url.startsWith('/uploads')) {
                // 提取文件名
                const fileName = url.split('/').pop() || '';
                url = `/uploads/${fileName}`;
              }
              // 注意：uploads路径不需要添加/api前缀，因为Nginx会直接处理静态文件请求
              // 或者通过后端提供的静态文件服务，保持原样即可
            }
          }
          
          return {
            id: photo.id.toString(),
            name: photo.fileName,
            url: url,
            tags: [],
            location: photo.street || photo.detailed_location || '未知位置',
            uploadedBy: photo.uploadedBy || 'unknown',
            uploadTime: photo.uploadTime ? new Date(photo.uploadTime).toLocaleString() : '',
            rating: photo.rating,
            usedForTraining: photo.analyzed || false,
            trainingModels: [],
            photoType: photo.photoType || 'other',
            typeLabel: typeLabels[photo.photoType] || '其他',
            aiScoreDetails: photo.dimensionScores || null,
          };
        });
        setPhotos(formattedPhotos);
        setFilteredPhotos(formattedPhotos);
      }
    } catch (error) {
      console.error('获取照片列表失败:', error);
      message.error('获取照片列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查当前用户权限
  const canDeletePhotos = user?.role === Role.ADMIN || user?.role === Role.DEVELOPER;
  const canRatePhotos = user?.role === Role.ADMIN || user?.role === Role.DEVELOPER;

  // 过滤照片
  const filterPhotos = () => {
    let filtered = [...photos];
    
    // 按搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(photo => 
        photo.name.toLowerCase().includes(searchText.toLowerCase()) ||
        photo.location.toLowerCase().includes(searchText.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    // 按类型过滤
    if (selectedType) {
      filtered = filtered.filter(photo => photo.photoType === selectedType);
    }
    
    // 按位置过滤
    if (selectedLocation) {
      filtered = filtered.filter(photo => photo.location === selectedLocation);
    }
    
    // 按日期范围过滤 (简化版，实际项目中需要更复杂的日期比较)
    if (dateRange.length === 2) {
      // 这里应该进行实际的日期范围过滤
      console.log('日期范围过滤:', dateRange[0], dateRange[1]);
    }
    
    setFilteredPhotos(filtered);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterPhotos();
  };

  // 处理类型选择
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    filterPhotos();
  };

  // 处理位置选择
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    filterPhotos();
  };

  // 处理日期范围选择
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates || []);
    filterPhotos();
  };

  // 预览照片
  const handlePreview = (photo: any) => {
    setSelectedPhoto(photo);
    setPreviewVisible(true);
  };

  // 删除照片
  const handleDelete = (photo: any) => {
    setSelectedPhoto(photo);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedPhoto) {
      try {
        const response = await deletePhoto(parseInt(selectedPhoto.id));
        if (response.success) {
          // 同时更新photos和filteredPhotos状态
          const updatedPhotos = photos.filter(photo => photo.id !== selectedPhoto.id);
          setPhotos(updatedPhotos);
          // 直接更新filteredPhotos，避免依赖异步状态更新
          const updatedFilteredPhotos = filteredPhotos.filter(photo => photo.id !== selectedPhoto.id);
          setFilteredPhotos(updatedFilteredPhotos);
          message.success(`成功删除照片: ${selectedPhoto.name}`);
        } else {
          message.error(response.message || '删除照片失败');
        }
      } catch (error) {
        console.error('删除照片失败:', error);
        message.error('删除照片失败');
      }
    }
    setIsDeleteModalVisible(false);
  };

  // 打开评分弹窗
  const handleRateClick = (photo: any) => {
    setSelectedPhoto(photo);
    setNewRating(photo.rating || 0);
    setIsRatingModalVisible(true);
  };

  // 保存评分
  const saveRating = async () => {
    if (selectedPhoto) {
      try {
        // 调用API保存评分到后端
        const saveResult = await api.updatePhoto(selectedPhoto.id, { rating: newRating });
        if (saveResult.success) {
          // 更新前端状态
          const updatedPhotos = photos.map(photo => 
            photo.id === selectedPhoto.id 
              ? { ...photo, rating: newRating }
              : photo
          );
          setPhotos(updatedPhotos);
          filterPhotos();
          message.success(`成功更新照片评分: ${selectedPhoto.name}`);
        } else {
          console.warn('保存评分结果失败:', saveResult.message);
          message.warning('评分结果保存失败，请重试');
        }
      } catch (error) {
        console.error('保存评分失败:', error);
        message.error('保存评分失败，请重试');
      }
    }
    setIsRatingModalVisible(false);
  };

  // 场景识别函数
  const detectScene = (photo: any): boolean => {
    console.log('开始场景检测:', { photoName: photo.name, photoType: photo.photoType });
    
    // 检查照片类型是否为街道相关类型
    const streetRelatedTypes = ['shop_sign_building', 'greenery', 'sidewalk', 'bike_lane', 'urban_facilities'];
    
    // 检查照片类型
    if (photo.photoType && streetRelatedTypes.includes(photo.photoType)) {
      console.log('检测到街道相关类型:', photo.photoType);
      return true;
    }
    
    // 检查照片名称，过滤明显非街道场景
    const nonStreetKeywords = [
      // 动漫相关关键词
      'anime', 'manga', 'cartoon', 'animation', 'anim',
      'anime girl', 'anime boy', 'anime character', 'anime art',
      'anime style', 'anime illustration', 'anime drawing',
      // 游戏相关关键词
      'game character', 'game art', 'game design', 'game sprite',
      'game model', 'game texture', 'game asset',
      // 其他明确非街道场景
      'avatar', 'portrait', 'selfie', 'cosplay', 'costume',
      'illustration', 'drawing', 'painting', 'art', 'sketch', 'comic',
      // 中文关键词
      '动漫', '卡通', '插画', '绘画', '艺术', '漫画', '游戏',
      '人物', '肖像', '自拍'
    ];
    
    // 安全检查：如果photo.name为undefined，直接返回true（默认认为是街道场景）
    if (!photo.name) {
      console.log('照片名称为undefined，默认认为是街道场景');
      return true;
    }
    
    const photoName = photo.name.toLowerCase();
    
    // 检查文件名是否包含非街道场景关键词
    for (const keyword of nonStreetKeywords) {
      if (photoName.includes(keyword)) {
        console.log('检测到非街道场景关键词:', keyword, '在文件:', photoName);
        return false;
      }
    }
    
    // 检查照片类型是否明确为非街道场景
    const nonStreetTypes = ['avatar', 'portrait', 'animal', 'nature', 'food', 'indoor', 'anime', 'cartoon', 'game'];
    if (photo.photoType && nonStreetTypes.includes(photo.photoType)) {
      console.log('检测到非街道场景类型:', photo.photoType);
      return false;
    }
    
    // 检查文件扩展名，过滤常见的非图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = photo.name.toLowerCase().substring(photo.name.lastIndexOf('.'));
    if (!imageExtensions.includes(fileExtension)) {
      console.log('检测到非图片文件:', fileExtension);
      return false;
    }
    
    // 对于类型为'other'的照片，默认认为是街道场景（除非包含明确的非街道场景关键词）
    if (photo.photoType === 'other') {
      console.log('类型为other，默认认为是街道场景:', photo.name);
      return true;
    }
    
    // 默认认为是街道场景
    console.log('默认认为是街道场景:', photo.name);
    return true;
  };

  // AI 评分处理函数
  const handleAiScore = async (photo: any) => {
    // 添加到正在评分的ID集合
    setAiScoringIds(prev => new Set(prev).add(photo.id));
    try {
      console.log('开始AI评分:', { photoId: photo.id, photoName: photo.name, photoUrl: photo.url, photoType: photo.photoType });
      
      // 场景识别：过滤非街道场景
      if (!detectScene(photo)) {
        throw new Error('非街道场景图片，无法进行城市环境评分');
      }
      
      // 从照片URL获取文件
      let response;
      try {
        // 处理文件路径，确保包含/uploads前缀和正确的格式
        let filePath = photo.url;
        console.log('原始filePath:', filePath);
        
        // 处理空路径情况
        if (!filePath) {
          throw new Error('照片路径为空');
        }
        
        // 确保URL格式正确
        let fileUrl = filePath;
        if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
          // 确保路径以/uploads开头
          if (!fileUrl.startsWith('/uploads')) {
            // 提取文件名
            const fileName = fileUrl.split('/').pop() || '';
            fileUrl = `/uploads/${fileName}`;
          }
          // 注意：uploads路径不需要添加/api前缀，因为Nginx会直接处理静态文件请求
        }
        console.log('处理后的fileUrl:', fileUrl);
        console.log('尝试获取文件:', fileUrl);
        response = await fetch(fileUrl);
        console.log('fetch响应:', { status: response.status, statusText: response.statusText });
        
        if (!response.ok) {
          throw new Error(`文件获取失败: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error('文件获取失败:', fetchError);
        throw new Error(`文件获取失败: ${fetchError.message}`);
      }
      
      const blob = await response.blob();
      console.log('blob信息:', { size: blob.size, type: blob.type });
      
      if (blob.size === 0) {
        throw new Error('文件为空');
      }
      
      const file = new File([blob], photo.name, { type: blob.type });
      console.log('创建的文件:', { name: file.name, size: file.size, type: file.type });
      
      // 调用AI评分API
      const result = await scoreImage(file, photo.photoType || 'other');
      console.log('AI评分结果:', result);
      
      // 检查返回结果是否有效
      if (!result || !result.overallScore) {
        throw new Error('评分结果无效');
      }
      
      // 保存评分结果到后端（包括多维度评分）
      const saveResult = await api.updatePhotoRating(photo.id, result.overallScore, result.dimensionScores);
      console.log('保存评分结果:', saveResult);
      
      if (!saveResult.success) {
        console.warn('保存评分结果失败，但继续更新前端状态:', saveResult.message);
        message.warning('评分结果保存失败，但已完成评分计算');
      }
      
      // 更新照片评分
      const updatedPhotos = photos.map(p => 
        p.id === photo.id 
          ? { ...p, rating: result.overallScore, aiScoreDetails: result.dimensionScores }
          : p
      );
      setPhotos(updatedPhotos);
      // 直接更新filteredPhotos以确保立即显示评分
      const updatedFilteredPhotos = filteredPhotos.map(p => 
        p.id === photo.id 
          ? { ...p, rating: result.overallScore, aiScoreDetails: result.dimensionScores }
          : p
      );
      setFilteredPhotos(updatedFilteredPhotos);
      message.success(`AI评分完成: ${photo.name} - ${result.overallScore}分`);
    } catch (error) {
      console.error('AI评分失败:', error);
      
      const err = error as any;
      
      // 更详细的错误处理
      if (err.response) {
        console.error('响应错误:', { status: err.response.status, data: err.response.data });
        if (err.response.status === 404) {
          message.error('文件不存在，请检查照片是否已上传成功');
        } else if (err.response.status === 500) {
          message.error('服务器内部错误，请稍后重试');
        } else {
          message.error(`AI评分失败: ${err.response.data?.message || '未知错误'}`);
        }
      } else if (err.request) {
        console.error('请求错误:', err.request);
        message.error('网络请求失败，请检查网络连接');
      } else if (err.message) {
        console.error('其他错误:', err.message);
        if (err.message.includes('文件获取失败')) {
          message.error('照片文件获取失败，请检查文件是否存在');
        } else if (err.message.includes('文件为空')) {
          message.error('照片文件为空，请重新上传');
        } else if (err.message.includes('照片路径为空')) {
          message.error('照片路径为空，请重新上传照片');
        } else if (err.message.includes('非街道场景图片')) {
          message.error('非街道场景图片，无法进行城市环境评分');
        } else {
          message.error(`AI评分失败: ${err.message}`);
        }
      } else {
        message.error('AI评分失败，请重试');
      }
    } finally {
      // 从正在评分的ID集合中移除
      setAiScoringIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
    }
  };

  // 获取所有唯一类型
  const allTypes = typeOptions;
  
  // 获取所有唯一位置
  const allLocations = Array.from(new Set(photos.map(photo => photo.location)));

  // 表格列配置
  const columns: ColumnsType<any> = [
    {
      title: '照片',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string, record: any) => (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '8px 0'
          }}
        >
          {imageLoadErrors.has(record.id) ? (
            <div 
              style={{ 
                width: 80, 
                height: 60, 
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#999',
                marginBottom: '8px'
              }}
            >
              图片加载失败
            </div>
          ) : (
            <img 
              src={url} 
              alt={record.name} 
              style={{ 
                width: 80, 
                height: 60, 
                objectFit: 'cover', 
                cursor: 'pointer',
                marginBottom: '8px'
              }}
              onClick={() => handlePreview(record)}
              onError={() => {
                setImageLoadErrors(prev => new Set(prev).add(record.id));
              }}
            />
          )}
          <span 
            style={{ 
              fontSize: '12px', 
              color: '#999',
              textAlign: 'center',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {record.name}
          </span>
        </div>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'typeLabel',
      key: 'typeLabel',
      width: 150,
      render: (typeLabel: string) => (
        <Tag color="blue" style={{ fontSize: 12 }}>{typeLabel}</Tag>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: number) => rating !== undefined && rating !== null ? <Tag color="blue">{rating}分</Tag> : <span style={{ color: '#999' }}>未评分</span>,
    },
    {
      title: '上传者',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 120,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          
          {canRatePhotos && (
            <Tooltip title="评分">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => handleRateClick(record)}
              />
            </Tooltip>
          )}
          
          {canRatePhotos && (
            <Tooltip title="AI评分">
              <Button 
                type="text" 
                icon={<SyncOutlined />}
                loading={aiScoringIds.has(record.id)}
                onClick={() => handleAiScore(record)}
              />
            </Tooltip>
          )}
          
          {canDeletePhotos && (
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="photo-management">
      <h2>照片管理系统</h2>
      
      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Search
            placeholder="搜索照片名称、位置或标签"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
          
          <Select
            placeholder="按类型过滤"
            style={{ width: 150 }}
            allowClear
            onChange={handleTypeChange}
          >
            {allTypes.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="按位置过滤"
            style={{ width: 150 }}
            allowClear
            onChange={handleLocationChange}
          >
            {allLocations.map(location => (
              <Option key={location} value={location}>{location}</Option>
            ))}
          </Select>
          
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={fetchPhotos}
            loading={loading}
          >
            刷新列表
          </Button>
          
          <RangePicker onChange={handleDateRangeChange} />
        </Space>
      </Card>
      
      {/* 照片列表 */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredPhotos}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Spin>
      
      {/* 照片预览弹窗 */}
      <Modal
        title={selectedPhoto?.name || ''}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPhoto && (
          <div>
            <img alt={selectedPhoto.name} src={selectedPhoto.url} style={{ width: '100%' }} />
            <div style={{ marginTop: 16 }}>
              <p><strong>位置:</strong> {selectedPhoto.location}</p>
              <p><strong>上传者:</strong> {selectedPhoto.uploadedBy} | <strong>上传时间:</strong> {selectedPhoto.uploadTime}</p>
              <p><strong>评分:</strong> {selectedPhoto.rating || '未评分'}</p>
              <p><strong>类型:</strong> {selectedPhoto.typeLabel}</p>
              {selectedPhoto.aiScoreDetails && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>多维度评分:</strong></p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                    {Object.entries(selectedPhoto.aiScoreDetails).map(([key, value]) => (
                      <div key={key} style={{ backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        <span style={{ fontSize: 12 }}>{key}:</span>
                        <span style={{ marginLeft: 4, fontWeight: 'bold' }}>{String(value)}分</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPhoto.usedForTraining && (
                <p><strong>已用于训练模型:</strong> {selectedPhoto.trainingModels.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除照片 "{selectedPhoto?.name || ''}" 吗？此操作不可撤销。</p>
      </Modal>
      
      {/* 评分弹窗 */}
      <Modal
        title="为照片评分"
        open={isRatingModalVisible}
        onOk={saveRating}
        onCancel={() => setIsRatingModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        {selectedPhoto && (
          <div>
            <p style={{ marginBottom: 16 }}>照片: {selectedPhoto.name}</p>
            <img alt={selectedPhoto.name} src={selectedPhoto.url} style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
            <div style={{ marginTop: 16 }}>
              <span style={{ marginRight: 8 }}>评分: {newRating}分</span>
              <Slider 
                min={0} 
                max={5} 
                step={0.1} 
                value={newRating} 
                onChange={setNewRating} 
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoManagement;