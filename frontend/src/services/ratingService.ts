import axios from 'axios';
import { scoreImage as aiScoreImage } from '../api/ai';
import { 
  RatingResult, 
  RatingRequest, 
  RatingComparison, 
  Suggestion, 
  SuggestionRequest, 
  RatingHistory, 
  RatingStatistics, 
  RatingDimensionConfig, 
  DimensionScore, 
  RatingDimension 
} from '../types/rating';
import { Result } from '../types/result';

// API基础路径
const API_BASE_URL = '/api';

/**
 * 评分和建议生成相关API服务
 */
const ratingService = {
  /**
   * 对照片进行评分
   * @param request 评分请求参数
   * @param file 照片文件
   * @returns 评分结果
   */
  ratePhoto: async (request: RatingRequest, file?: File): Promise<RatingResult> => {
    try {
      // 调用AI评分API
      const aiResult = await aiScoreImage(file || new File([], 'default.jpg'), 'urban');
      
      // 转换为RatingResult格式
      const dimensionMap: Record<string, RatingDimension> = {
        '环境整洁度': 'cleanliness',
        '绿化覆盖': 'green_space',
        '基础设施': 'infrastructure',
        '视觉质量': 'visual_quality',
        '文化元素': 'cultural_elements'
      };
      
      const dimensions: DimensionScore[] = Object.entries(aiResult.dimensionScores).map(([key, score]) => ({
        dimension: dimensionMap[key] || 'visual_quality',
        score: score,
        maxScore: 100,
        weight: 0.2
      }));
      
      const result: RatingResult = {
        id: `ai_${Date.now()}`,
        photoId: request.photoId,
        userId: request.userId || 'system',
        overallScore: aiResult.overallScore,
        maxScore: 100,
        dimensions: dimensions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return result;
    } catch (error) {
      console.error('AI照片评分失败:', error);
      throw error;
    }
  },

  /**
   * 批量评分照片
   * @param requests 评分请求列表
   * @param files 照片文件列表
   * @returns 批量评分结果
   */
  batchRatePhotos: async (requests: RatingRequest[], files?: File[]): Promise<RatingResult[]> => {
    try {
      const results: RatingResult[] = [];
      
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const file = files?.[i];
        const result = await ratingService.ratePhoto(request, file);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('AI批量评分失败:', error);
      throw error;
    }
  },

  /**
   * 获取照片的评分结果
   * @param photoId 照片ID
   * @returns 评分结果
   */
  getRatingByPhotoId: async (photoId: string): Promise<RatingResult> => {
    try {
      const response = await axios.get<Result<RatingResult>>(`${API_BASE_URL}/ratings/photos/${photoId}`);
      return response.data.data;
    } catch (error) {
      console.error(`获取照片 ${photoId} 的评分失败:`, error);
      throw error;
    }
  },

  /**
   * 获取评分维度配置
   * @returns 评分维度配置列表
   */
  getRatingDimensions: async (): Promise<RatingDimensionConfig[]> => {
    try {
      const response = await axios.get<Result<RatingDimensionConfig[]>>(`${API_BASE_URL}/ratings/config`);
      return response.data.data;
    } catch (error) {
      console.error('获取评分维度配置失败:', error);
      throw error;
    }
  },

  /**
   * 比较两张照片的评分结果
   * @param baseRatingId 基础评分ID
   * @param comparedRatingId 对比评分ID
   * @returns 评分比较结果
   */
  compareRatings: async (baseRatingId: string, comparedRatingId: string): Promise<RatingComparison> => {
    try {
      const response = await axios.get<Result<RatingComparison>>(
        `${API_BASE_URL}/ratings/compare?photoId1=${baseRatingId}&photoId2=${comparedRatingId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('评分比较失败:', error);
      throw error;
    }
  },

  /**
   * 生成照片改进建议
   * @param request 建议生成请求参数
   * @returns 改进建议列表
   */
  generateSuggestions: async (request: SuggestionRequest): Promise<Suggestion[]> => {
    try {
      const response = await axios.post<Result<Suggestion[]>>(`${API_BASE_URL}/ratings/suggestions`, request);
      return response.data.data;
    } catch (error) {
      console.error('生成改进建议失败:', error);
      throw error;
    }
  },

  /**
   * 获取照片的建议
   * @param photoId 照片ID
   * @returns 该照片的建议列表
   */
  getSuggestionsByPhotoId: async (photoId: string): Promise<Suggestion[]> => {
    try {
      const response = await axios.get<Result<Suggestion[]>>(`${API_BASE_URL}/ratings/photos/${photoId}/history`);
      return response.data.data;
    } catch (error) {
      console.error(`获取照片 ${photoId} 的建议失败:`, error);
      throw error;
    }
  },

  /**
   * 获取照片的评分历史
   * @param photoId 照片ID
   * @returns 评分历史记录
   */
  getRatingHistory: async (photoId: string): Promise<RatingHistory> => {
    try {
      const response = await axios.get<Result<RatingHistory>>(`${API_BASE_URL}/ratings/photos/${photoId}/history`);
      return response.data.data;
    } catch (error) {
      console.error(`获取照片 ${photoId} 的评分历史失败:`, error);
      throw error;
    }
  },

  /**
   * 获取评分统计信息
   * @param query 统计查询参数
   * @returns 评分统计结果
   */
  getRatingStatistics: async (query?: {
    userId?: string;
    areaId?: string;
    dimension?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RatingStatistics> => {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await axios.get<Result<RatingStatistics>>(
        `${API_BASE_URL}/ratings/statistics?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('获取评分统计失败:', error);
      throw error;
    }
  },

  /**
   * 删除评分
   * @param ratingId 评分ID
   */
  deleteRating: async (ratingId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/ratings/${ratingId}`);
    } catch (error) {
      console.error(`删除评分 ${ratingId} 失败:`, error);
      throw error;
    }
  }
};

// 命名导出
export const deleteRating = ratingService.deleteRating;
export const exportRatingData = (_ratingId: string): Promise<Blob> => Promise.resolve(new Blob()); // 临时实现，使用下划线前缀标记未使用参数
export const getRatingById = (_id: string): Promise<RatingResult | null> => Promise.resolve(null); // 临时实现，使用下划线前缀标记未使用参数
export const comparePhotos = (_photoId1: number, _photoId2: number): Promise<any> => Promise.resolve(null); // 临时实现
export const getRatingResult = (_photoId: number): Promise<any> => Promise.resolve(null); // 临时实现，使用下划线前缀标记未使用参数

export default ratingService;