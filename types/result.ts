/**
 * 通用API响应结果接口
 */
export interface Result<T = any> {
  /**
   * 状态码
   */
  code: number;
  
  /**
   * 响应消息
   */
  message: string;
  
  /**
   * 响应数据
   */
  data: T;
  
  /**
   * 是否成功
   */
  success: boolean;
  
  /**
   * 时间戳
   */
  timestamp: number;
}

/**
 * 分页参数接口
 */
export interface PageParams {
  /**
   * 当前页码，从0开始
   */
  page?: number;
  
  /**
   * 每页大小
   */
  size?: number;
}

/**
 * 分页结果接口
 */
export interface PageResult<T = any> {
  /**
   * 数据列表
   */
  content: T[];
  
  /**
   * 总数据条数
   */
  totalElements: number;
  
  /**
   * 总页数
   */
  totalPages: number;
  
  /**
   * 当前页码，从0开始
   */
  number: number;
  
  /**
   * 每页大小
   */
  size: number;
  
  /**
   * 是否有下一页
   */
  hasNext: boolean;
  
  /**
   * 是否有上一页
   */
  hasPrevious: boolean;
  
  /**
   * 是否是第一页
   */
  first: boolean;
  
  /**
   * 是否是最后一页
   */
  last: boolean;
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  /**
   * 错误码
   */
  code: string | number;
  
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 错误详情
   */
  details?: any;
}
