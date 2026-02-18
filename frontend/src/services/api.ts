// 照片上传和处理相关的API服务

const API_BASE_URL = '/api';

// 模拟数据 - 上传的照片列表
const mockPhotos: any[] = [];

// API响应结果类型
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 照片上传请求参数类型
export interface UploadPhotoParams {
  file: File;
  description: string;
  location: {
    province: string;
    city: string;
    district: string;
    street?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  tags?: string[];
}

// 照片信息类型
export interface PhotoInfo {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  location: {
    province: string;
    city: string;
    district: string;
    street?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  tags?: string[];
  uploadTime: string;
  uploader: string;
}

// 导出单独的函数供PhotoUpload组件使用
export const fetchImage = async (imageId: string): Promise<ApiResult<PhotoInfo>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const photo = mockPhotos.find(p => p.id === imageId);
  return {
    success: !!photo,
    data: photo,
    message: photo ? undefined : 'Image not found'
  };
};

export const uploadImage = async (file: File): Promise<ApiResult<{id: string, url: string}>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const result = {
    id: `img_${Date.now()}`,
    url: URL.createObjectURL(file)
  };
  return { success: true, data: result };
};

export const analyzeImage = async (_imageId: string): Promise<ApiResult<{
  description: string;
  location: string;
  timestamp: string;
  category: string;
}>> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    success: true,
    data: {
      description: '图像分析结果：城市基础设施状况良好',
      location: '自动识别位置：城市中心区域',
      timestamp: new Date().toISOString(),
      category: '城市治理'
    }
  };
};

export const submitForm = async (_formData: any): Promise<ApiResult<{success: boolean}>> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true, data: { success: true } };
};

// 真正的照片上传API调用
export const uploadPhotoToServer = async (
  file: File,
  metadata?: {
    province?: string;
    city?: string;
    district?: string;
    street?: string;
    detailedLocation?: string;
    description?: string;
  }
): Promise<ApiResult<{id: string, url: string}>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/photos/upload`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok && result.code === 200) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || '上传失败'
      };
    }
  } catch (error) {
    console.error('上传照片失败:', error);
    return {
      success: false,
      message: '网络错误，上传失败'
    };
  }
};

// 批量上传照片API调用
export const batchUploadPhotosToServer = async (
  files: File[],
  metadata?: {
    province?: string;
    city?: string;
    district?: string;
    street?: string;
    detailedLocation?: string;
    description?: string;
    photoType?: string;
  }
): Promise<ApiResult<Array<{fileName: string, size: number, success: boolean}>>> => {
  try {
    console.log('开始批量上传，文件数组:', files);
    console.log('文件数组长度:', files.length);
    console.log('第一个文件:', files[0]);
    console.log('位置信息:', metadata);
    
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`添加文件 ${index}:`, file);
      formData.append('files', file);
    });
    
    if (metadata) {
      if (metadata.province) {
        formData.append('province', metadata.province);
      }
      if (metadata.city) {
        formData.append('city', metadata.city);
      }
      if (metadata.district) {
        formData.append('district', metadata.district);
      }
      if (metadata.street) {
        formData.append('street', metadata.street);
      }
      if (metadata.detailedLocation) {
        formData.append('detailedLocation', metadata.detailedLocation);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.photoType) {
        formData.append('photoType', metadata.photoType);
      }
    }
    
    console.log('上传文件数量:', files.length);
    console.log('FormData内容:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    
    console.log('准备发送请求到:', `${API_BASE_URL}/photos/upload/batch`);
    console.log('完整URL:', `${API_BASE_URL}/photos/upload/batch`);
    console.log('当前页面URL:', window.location.href);
    console.log('当前域名:', window.location.hostname);
    console.log('当前协议:', window.location.protocol);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const startTime = Date.now();
    console.log('请求开始时间:', new Date(startTime).toISOString());
    console.log('FormData对象:', formData);
    console.log('FormData entries数量:', Array.from(formData.entries()).length);
    
    console.log('=== 准备发送fetch请求 ===');
    
    const response = await fetch(`${API_BASE_URL}/photos/upload/batch`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache'
    });
    
    console.log('=== fetch请求已完成 ===');
    const endTime = Date.now();
    console.log('请求结束时间:', new Date(endTime).toISOString());
    console.log('请求耗时:', (endTime - startTime) + 'ms');
    console.log('响应状态:', response.status, response.statusText);
    console.log('响应头:', response.headers);
    console.log('响应类型:', response.type);
    console.log('响应URL:', response.url);
    console.log('响应是否ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('响应数据:', data);
      return {
        success: true,
        data: data
      };
    } else {
      const errorText = await response.text();
      console.error('响应错误:', errorText);
      console.error('完整响应:', response);
      return {
        success: false,
        message: `批量上传失败 (${response.status})`
      };
    }
  } catch (error) {
    console.error('批量上传照片失败:', error);
    return {
      success: false,
      message: '网络错误，批量上传失败'
    };
  }
};

// API服务
export const api = {
  fetchImage,
  uploadImage,
  analyzeImage,
  submitForm,
  batchUploadPhotos: batchUploadPhotosToServer,
  
  // 获取照片列表
  getPhotos: async (page: number = 1, size: number = 10, filters?: any): Promise<ApiResult<any[]>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/photos/?${params.toString()}`, {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: result.success || true,
          data: result.data || []
        };
      } else {
        return {
          success: false,
          message: result.message || '获取照片列表失败'
        };
      }
    } catch (error) {
      console.error('获取照片列表失败:', error);
      return {
        success: false,
        message: '网络错误，获取照片列表失败'
      };
    }
  },
  
  // 上传照片
  uploadPhoto: async (params: UploadPhotoParams): Promise<ApiResult<PhotoInfo>> => {
    // 模拟异步请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成模拟的上传结果
    const newPhoto: PhotoInfo = {
      id: `photo_${Date.now()}`,
      url: URL.createObjectURL(params.file), // 模拟上传后的URL
      thumbnailUrl: URL.createObjectURL(params.file), // 模拟缩略图URL
      description: params.description,
      location: params.location,
      tags: params.tags,
      uploadTime: new Date().toISOString(),
      uploader: 'current_user' // 模拟上传用户
    };
    
    // 添加到模拟数据列表
    mockPhotos.push(newPhoto);
    
    // 返回成功结果
    return {
      success: true,
      data: newPhoto
    };
  },
  
  // 获取照片列表（模拟）
  getPhotosMock: async (): Promise<ApiResult<PhotoInfo[]>> => {
    // 模拟异步请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 返回照片列表
    return {
      success: true,
      data: mockPhotos
    };
  },
  
  // 更新照片信息
  updatePhoto: async (photoId: string | number, updateData: { rating?: number }): Promise<ApiResult<{ rating: number }>> => {
    try {
      // 确保photoId是数字类型
      const numericPhotoId = typeof photoId === 'string' ? parseInt(photoId) : photoId;
      // 检查photoId是否有效
      if (isNaN(numericPhotoId)) {
        return {
          success: false,
          message: '无效的照片ID'
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/photos/${numericPhotoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('PUT请求响应状态:', response.status);
      console.log('PUT请求URL:', `${API_BASE_URL}/photos/${numericPhotoId}`);
      
      const result = await response.json();
      console.log('PUT请求响应数据:', result);
      
      if (response.ok && result.success) {
        return {
          success: true,
          data: { rating: result.rating }
        };
      } else {
        return {
          success: false,
          message: result.message || '更新照片信息失败'
        };
      }
    } catch (error) {
      console.error('更新照片信息失败:', error);
      return {
        success: false,
        message: '网络错误，更新照片信息失败'
      };
    }
  },
  
  // 更新照片评分（包括多维度评分）
  updatePhotoRating: async (photoId: string | number, rating: number, dimensionScores: any): Promise<ApiResult<any>> => {
    try {
      // 确保photoId是数字类型
      const numericPhotoId = typeof photoId === 'string' ? parseInt(photoId) : photoId;
      // 检查photoId是否有效
      if (isNaN(numericPhotoId)) {
        return {
          success: false,
          message: '无效的照片ID'
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/photos/${numericPhotoId}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, dimensionScores })
      });
      
      console.log('更新评分请求响应状态:', response.status);
      console.log('更新评分请求URL:', `${API_BASE_URL}/photos/${numericPhotoId}/rating`);
      
      const result = await response.json();
      console.log('更新评分请求响应数据:', result);
      
      if (response.ok && result.success) {
        return {
          success: true,
          data: {
            rating: result.rating,
            dimensionScores: result.aiScoreDetails
          }
        };
      } else {
        return {
          success: false,
          message: result.message || '更新照片评分失败'
        };
      }
    } catch (error) {
      console.error('更新照片评分失败:', error);
      return {
        success: false,
        message: '网络错误，更新照片评分失败'
      };
    }
  }
};

export default api;