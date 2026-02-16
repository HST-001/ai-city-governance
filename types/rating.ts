/**
 * 评分系统相关类型定义
 */

/**
 * 评分维度类型
 */
export type RatingDimension = 
  | 'visual_quality'      // 视觉质量
  | 'lighting'           // 光线条件
  | 'composition'        // 构图
  | 'color_balance'      // 色彩平衡
  | 'clarity'            // 清晰度
  | 'urban_planning'     // 城市规划
  | 'green_space'        // 绿地覆盖
  | 'infrastructure'     // 基础设施
  | 'cleanliness'        // 整洁度
  | 'cultural_elements';  // 文化元素

/**
 * 评分维度配置接口
 */
export interface RatingDimensionConfig {
  id: RatingDimension;
  name: string;          // 维度名称
  description: string;   // 维度描述
  weight: number;        // 权重（0-1之间的浮点数）
  minScore: number;      // 最低分数
  maxScore: number;      // 最高分数
}

/**
 * 单个维度评分接口
 */
export interface DimensionScore {
  dimension: RatingDimension;
  score: number;         // 实际得分
  maxScore: number;      // 满分
  weight: number;        // 权重
  description?: string;  // 得分说明
  tips?: string[];       // 改进建议
}

/**
 * 评分结果接口
 */
export interface RatingResult {
  id: string;            // 评分ID
  photoId: string;       // 关联的照片ID
  userId: string;        // 评分用户ID
  overallScore: number;  // 总体评分
  maxScore: number;      // 满分
  dimensions: DimensionScore[];  // 各维度评分
  feedback?: string;     // 综合反馈
  suggestions?: string[];  // 综合建议
  createdAt: string;     // 评分创建时间
  updatedAt: string;     // 评分更新时间
}

/**
 * 评分请求接口
 */
export interface RatingRequest {
  photoId: string;       // 照片ID
  userId?: string;       // 用户ID（可选，默认为当前用户）
  dimensions?: Partial<Record<RatingDimension, number>>;  // 可选的人工预设维度评分
}

/**
 * 评分比较结果接口
 */
export interface RatingComparison {
  baseRating: RatingResult;      // 基础评分
  comparedRating: RatingResult;  // 对比评分
  improvements: {
    dimension: RatingDimension;
    improvement: number;  // 提升量
    percentage: number;   // 提升百分比
  }[];
  overallImprovement: number;    // 总体提升量
  overallPercentage: number;     // 总体提升百分比
}

/**
 * 建议类型接口
 */
export interface Suggestion {
  id: string;            // 建议ID
  type: 'improvement' | 'maintenance' | 'enhancement';  // 建议类型：改进、维护、增强
  category: string;      // 建议分类
  title: string;         // 建议标题
  description: string;   // 建议详细描述
  priority: 'high' | 'medium' | 'low';  // 优先级
  estimatedEffort: 'low' | 'medium' | 'high';  // 预计工作量
  dimension?: RatingDimension;  // 关联的评分维度
  expectedImpact?: number;  // 预期改进效果（-100到100）
  createdAt: string;     // 创建时间
}

/**
 * 建议生成请求接口
 */
export interface SuggestionRequest {
  photoId: string;       // 照片ID
  ratingId?: string;     // 评分ID（可选，如果有则基于评分生成更精准的建议）
  priority?: 'high' | 'medium' | 'low';  // 优先级筛选
  limit?: number;        // 返回建议数量限制
}

/**
 * 评分历史记录接口
 */
export interface RatingHistory {
  photoId: string;       // 照片ID
  ratings: Omit<RatingResult, 'photoId' | 'dimensions'>[];  // 评分历史（不含详细维度评分）
}

/**
 * 评分统计接口
 */
export interface RatingStatistics {
  averageScore: number;  // 平均评分
  totalRatings: number;  // 评分总数
  highestScore: number;  // 最高评分
  lowestScore: number;   // 最低评分
  dimensionStats: {
    dimension: RatingDimension;
    averageScore: number;  // 维度平均分
    distribution: Record<number, number>;  // 分数分布（分数->数量）
  }[];
}
