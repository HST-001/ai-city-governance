// 导入实际使用的类型
import { LatLng, MapMarker, AreaBoundary } from '../types/map';
// import axios from 'axios';
// import { Result } from '../types/result';

// API基础路径
// 移除未使用的常量
// const _API_BASE_URL = '/api/map'; // 使用下划线前缀标记未使用的常量

// 模拟数据 - 地图标记点
const mockMarkers: MapMarker[] = [
  {
    id: '1',
    position: { lat: 39.9042, lng: 116.4074 },
    title: '天安门广场',
    description: '北京市中心的标志性广场，中国的象征之一',
    type: 'area',
    score: 95
  },
  {
    id: '2',
    position: { lat: 39.9154, lng: 116.3974 },
    title: '故宫博物院',
    description: '中国明清两代的皇家宫殿',
    type: 'area',
    score: 98
  },
  {
    id: '3',
    position: { lat: 39.9897, lng: 116.3077 },
    title: '颐和园',
    description: '中国清朝时期皇家园林',
    type: 'area',
    score: 92
  },
  {
    id: '4',
    position: { lat: 40.0076, lng: 116.3265 },
    title: '香山公园',
    description: '北京市海淀区的一座公园',
    type: 'area',
    score: 88
  },
  {
    id: '5',
    position: { lat: 39.9134, lng: 116.4551 },
    title: 'CBD商业区',
    description: '北京中央商务区',
    type: 'area',
    score: 85
  }
];

// 模拟数据 - 区域边界
const mockBoundaries: AreaBoundary[] = [
  {
    id: 'haidian',
    name: '海淀区',
    coordinates: [
      { lat: 39.9922, lng: 116.2913 },
      { lat: 40.0913, lng: 116.3854 },
      { lat: 40.0634, lng: 116.4783 },
      { lat: 39.9639, lng: 116.3876 },
      { lat: 39.9922, lng: 116.2913 }
    ],
    color: '#0088FE',
    opacity: 0.3
  },
  {
    id: 'chaoyang',
    name: '朝阳区',
    coordinates: [
      { lat: 39.8986, lng: 116.3086 },
      { lat: 40.0327, lng: 116.5026 },
      { lat: 39.9836, lng: 116.5818 },
      { lat: 39.8549, lng: 116.3961 },
      { lat: 39.8986, lng: 116.3086 }
    ],
    color: '#00C49F',
    opacity: 0.3
  },
  {
    id: 'dongcheng',
    name: '东城区',
    coordinates: [
      { lat: 39.8944, lng: 116.3468 },
      { lat: 39.9488, lng: 116.4351 },
      { lat: 39.9313, lng: 116.4699 },
      { lat: 39.8778, lng: 116.3841 },
      { lat: 39.8944, lng: 116.3468 }
    ],
    color: '#FFBB28',
    opacity: 0.3
  },
  {
    id: 'xicheng',
    name: '西城区',
    coordinates: [
      { lat: 39.8781, lng: 116.3053 },
      { lat: 39.9535, lng: 116.3860 },
      { lat: 39.9215, lng: 116.4314 },
      { lat: 39.8601, lng: 116.3563 },
      { lat: 39.8781, lng: 116.3053 }
    ],
    color: '#FF8042',
    opacity: 0.3
  }
];

/**
 * 地图服务工具
 * 提供地图数据的获取和处理功能
 */
const mapService = {
  /**
   * 获取地图标记点数据
   * @returns 地图标记点列表
   */
  getMarkers: async (): Promise<MapMarker[]> => {
    try {
      // 实际环境中应该调用后端API
      // const response = await axios.get<Result<MapMarker[]>>(`${API_BASE_URL}/markers`);
      // return response.data.data;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMarkers;
    } catch (error) {
      console.error('获取地图标记点失败:', error);
      throw error;
    }
  },

  /**
   * 根据区域获取地图标记点
   * @param areaId 区域ID
   * @returns 指定区域内的标记点列表
   */
  getMarkersByArea: async (areaId: string): Promise<MapMarker[]> => {
    try {
      // 实际环境中应该调用后端API
      // const response = await axios.get<Result<MapMarker[]>>(`${API_BASE_URL}/markers/area/${areaId}`);
      // return response.data.data;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 简单过滤模拟区域数据
      const filteredMarkers = mockMarkers.filter(marker => {
        // 这里只是简单模拟，实际应用中应该基于地理位置判断
        return areaId === 'haidian' ? marker.id === '4' : marker;
      });
      
      return filteredMarkers;
    } catch (error) {
      console.error(`获取区域 ${areaId} 的标记点失败:`, error);
      throw error;
    }
  },

  /**
   * 添加新的地图标记点
   * @param marker 标记点数据
   * @returns 添加后的标记点（包含ID）
   */
  addMarker: async (marker: Omit<MapMarker, 'id'>): Promise<MapMarker> => {
    try {
      // 实际环境中应该调用后端API
      // const response = await axios.post<Result<MapMarker>>(`${API_BASE_URL}/markers`, marker);
      // return response.data.data;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 创建新标记点（添加ID）
      const newMarker: MapMarker = {
        ...marker,
        id: `new-${Date.now()}`
      };
      
      return newMarker;
    } catch (error) {
      console.error('添加标记点失败:', error);
      throw error;
    }
  },

  /**
   * 删除地图标记点
   * @param markerId 标记点ID
   */
  deleteMarker: async (markerId: string | number): Promise<void> => {
    try {
      // 实际环境中应该调用后端API
      // await axios.delete(`${API_BASE_URL}/markers/${markerId}`);
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`删除标记点 ${markerId} 失败:`, error);
      throw error;
    }
  },

  /**
   * 获取区域边界数据
   * @returns 区域边界列表
   */
  getAreaBoundaries: async (): Promise<AreaBoundary[]> => {
    try {
      // 实际环境中应该调用后端API
      // const response = await axios.get<Result<AreaBoundary[]>>(`${API_BASE_URL}/boundaries`);
      // return response.data.data;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockBoundaries;
    } catch (error) {
      console.error('获取区域边界失败:', error);
      throw error;
    }
  },

  /**
   * 根据坐标获取地址信息（反向地理编码）
   * @param latlng 坐标位置
   * @returns 地址信息
   */
  getAddressFromCoords: async (latlng: LatLng): Promise<string> => {
    try {
      // 实际环境中应该调用地理编码API
      // const response = await axios.get(`/api/geo/reverse?lat=${latlng.lat}&lng=${latlng.lng}`);
      // return response.data.address;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 简单模拟反向地理编码结果
      return `北京市附近 (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;
    } catch (error) {
      console.error('获取地址信息失败:', error);
      throw error;
    }
  },

  /**
   * 根据地址获取坐标信息（正向地理编码）
   * @param address 地址文本
   * @returns 坐标位置
   */
  getCoordsFromAddress: async (address: string): Promise<LatLng> => {
    try {
      // 实际环境中应该调用地理编码API
      // const response = await axios.get(`/api/geo/geocode?address=${encodeURIComponent(address)}`);
      // return response.data.coordinates;
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 简单模拟正向地理编码结果
      // 查找是否有匹配的模拟数据
      const matchingMarker = mockMarkers.find(marker => 
        // 检查标记的标题和描述是否包含搜索地址
        marker.title?.includes(address) || marker.description?.includes(address)
      );
      
      if (matchingMarker) {
        return matchingMarker.position;
      }
      
      // 默认返回北京市中心坐标
      return { lat: 39.9042, lng: 116.4074 };
    } catch (error) {
      console.error('获取坐标信息失败:', error);
      throw error;
    }
  }
};
export default mapService;
