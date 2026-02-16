import axios, { AxiosInstance, AxiosResponse } from 'axios';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    // 如果响应已经包含success字段，直接返回
    if (res && typeof res === 'object' && 'success' in res) {
      return res;
    }
    
    // 如果响应不包含success字段（可能是异常响应），转换为统一格式
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: res,
        message: res.message || '操作成功'
      };
    } else {
      return {
        success: false,
        message: res.message || '操作失败',
        data: null
      };
    }
  },
  (error) => {
    console.error('Response error:', error);
    
    // 处理错误响应
    if (error.response) {
      const res = error.response.data;
      
      // 如果错误响应已经包含success字段，直接返回
      if (res && typeof res === 'object' && 'success' in res) {
        return res;
      }
      
      // 否则转换为统一格式
      return {
        success: false,
        message: res?.message || error.message || '请求失败',
        data: null
      };
    } else if (error.request) {
      return {
        success: false,
        message: '服务器无响应',
        data: null
      };
    } else {
      return {
        success: false,
        message: error.message || '请求配置错误',
        data: null
      };
    }
  }
);

export default service;
