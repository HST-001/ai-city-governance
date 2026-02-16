import request from '../utils/request';
import { Result } from '../types/result';

// 照片接口类型定义
export interface Photo {
  id: number;
  fileName: string;
  originalName: string;
  province: string;  // 修改为省份
  city: string;
  district: string;  // 修改为县区
  street: string;
  type: string;
  status: string;
  uploadTime: string;
  analyzeTime?: string;
  userId: number;
  username?: string;
  score?: number;
  filePath?: string;
}

// 分页查询参数
export interface PhotoQueryParams {
  page?: number;
  size?: number;
  province?: string;  // 添加省份参数
  city?: string;
  district?: string;
  type?: string;
  keyword?: string;
  status?: string;
}

// 分页结果
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 获取照片列表
 * @param params 查询参数
 */
export const getPhotos = async (params: PhotoQueryParams): Promise<Result<PageResult<Photo>>> => {
  return request.get('/photos', { params });
};

/**
 * 获取照片详情
 * @param id 照片ID
 */
export const getPhotoById = async (id: number): Promise<Result<Photo>> => {
  return request.get(`/photos/${id}`);
};

/**
 * 更新照片信息
 * @param id 照片ID
 * @param data 更新数据
 */
export const updatePhoto = async (id: number, data: Partial<Photo>): Promise<Result<Photo>> => {
  return request.put(`/photos/${id}`, data);
};

/**
 * 删除照片
 * @param id 照片ID
 */
export const deletePhoto = async (id: number): Promise<Result<null>> => {
  return request.delete(`/photos/${id}`);
};

/**
 * 批量删除照片
 * @param ids 照片ID列表
 */
export const batchDeletePhotos = async (ids: number[]): Promise<Result<null>> => {
  return request.post('/photos/batch-delete', { ids });
};

/**
 * 上传照片
 * @param formData 表单数据
 */
export const uploadPhoto = async (formData: FormData): Promise<Result<Photo>> => {
  return request.post('/photos/upload', formData);
};

/**
 * 批量上传照片
 * @param formData 表单数据
 */
export const batchUploadPhotos = async (formData: FormData): Promise<Result<Photo[]>> => {
  return request.post('/photos/batch-upload', formData);
};

/**
 * 获取省份列表
 */
export const getProvinces = async (): Promise<Result<string[]>> => {
  return request.get('/photos/provinces');
};

/**
 * 获取热门城市列表
 */
export const getHotCities = async (): Promise<Result<string[]>> => {
  return request.get('/photos/hot-cities');
};

/**
 * 根据省份获取城市列表
 * @param province 省份名称
 */
export const getCitiesByProvince = async (province: string): Promise<Result<string[]>> => {
  return request.get(`/photos/provinces/${province}/cities`);
};

/**
 * 根据城市获取县区列表
 * @param city 城市名称
 */
export const getDistrictsByCity = async (city: string): Promise<Result<string[]>> => {
  return request.get(`/photos/cities/${city}/districts`);
};

/**
 * 根据城市和县区获取街道列表
 * @param city 城市名称
 * @param district 县区名称
 */
export const getStreetsByCityAndDistrict = async (city: string, district: string): Promise<Result<string[]>> => {
  return request.get(`/photos/cities/${city}/districts/${district}/streets`);
};

/**
 * 按分析状态获取照片数量
 * @param status 分析状态
 */
export const getPhotosCountByStatus = async (status?: string): Promise<Result<number>> => {
  return request.get('/photos/count', { params: { status } });
};

/**
 * 获取城市照片统计
 */
export const getCityPhotoStats = async (): Promise<Result<Array<{name: string; value: number}>>> => {
  return request.get('/photos/stats/city');
};

/**
 * 获取照片类型统计
 */
export const getPhotoTypeStats = async (): Promise<Result<Array<{name: string; value: number}>>> => {
  return request.get('/photos/stats/type');
};