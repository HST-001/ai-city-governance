import axios from 'axios';

// 创建axios实例
const aiApi = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// 定义ScoreResult接口
interface ScoreResult {
  overallScore: number;
  dimensionScores: Record<string, number>;
}

// 图片评分
export const scoreImage = async (file: File, category: string): Promise<ScoreResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  
  const response = await aiApi.post<ScoreResult>('/ai/score', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// 批量图片评分
export const batchScoreImages = async (files: File[], category: string): Promise<ScoreResult[]> => {
  // 使用Promise.all并行处理多个文件的评分请求
  const scorePromises: Promise<ScoreResult>[] = [];
  
  files.forEach((file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    // 创建一个评分请求Promise并添加到数组中
    const scorePromise = aiApi
      .post<ScoreResult>('/score', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
    
    scorePromises.push(scorePromise);
  });
  
  // 等待所有评分请求完成
  const results = await Promise.all(scorePromises);
  return results;
};

// 图片分析
export const analyzeImage = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await aiApi.post('/ai/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export default aiApi;