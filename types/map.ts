/**
 * 地图相关类型定义
 */

// 经纬度坐标接口
export interface LatLng {
  lat: number;
  lng: number;
}

// 地图配置选项接口
export interface MapConfig {
  // 中心点坐标
  center: LatLng;
  // 地图缩放级别
  zoom?: number;
  // 最小缩放级别
  minZoom?: number;
  // 最大缩放级别
  maxZoom?: number;
  // 是否启用滚轮缩放
  scrollWheelZoom?: boolean;
  // 是否显示比例尺
  showScale?: boolean;
  // 是否显示控件
  showControls?: boolean;
  // 是否可拖拽
  draggable?: boolean;
}

// 地图标记点接口
export interface MapMarker {
  // 标记点唯一标识
  id: string | number;
  // 位置坐标
  position: LatLng;
  // 标题
  title?: string;
  // 描述信息
  description?: string;
  // 自定义图标
  icon?: string;
  // 图标大小
  iconSize?: [number, number];
  // 标记点类型
  type?: 'photo' | 'area' | 'problem' | 'default';
  // 关联的数据
  data?: any;
  // 是否可点击
  clickable?: boolean;
  // 评分（用于显示颜色）
  score?: number;
}

// 标记点集群配置
export interface MarkerClusterConfig {
  // 集群半径
  radius?: number;
  // 最小集群数量
  minClusterSize?: number;
  // 集群最大缩放级别
  maxZoom?: number;
}

// 热力图配置接口
export interface HeatmapConfig {
  // 热力图数据点列表
  data: Array<{
    lat: number;
    lng: number;
    value: number;
  }>;
  // 热力图最大强度
  maxIntensity?: number;
  // 热力图半径
  radius?: number;
  // 热力图模糊程度
  blur?: number;
  // 热力图颜色
  gradient?: Record<number, string>;
  // 是否可见
  visible?: boolean;
}

// 区域边界接口
export interface AreaBoundary {
  // 区域ID
  id: string | number;
  // 区域名称
  name: string;
  // 边界坐标点列表
  coordinates: LatLng[];
  // 区域颜色
  color?: string;
  // 透明度
  opacity?: number;
  // 关联的数据
  data?: any;
}

// 地图图层类型
export type MapLayerType = 'normal' | 'satellite' | 'terrain' | 'roadnet';

// 地图事件类型
export type MapEventType = 
  | 'click' 
  | 'dblclick'
  | 'rightclick'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'zoomstart'
  | 'zoom'
  | 'zoomend'
  | 'move';

// 地图点击事件参数
export interface MapClickEvent {
  latlng: LatLng;
  point: { x: number; y: number };
  originalEvent: MouseEvent;
}

// 地图信息窗口选项
export interface InfoWindowOptions {
  // 位置坐标
  position: LatLng;
  // 内容HTML
  content: string;
  // 是否自动关闭
  autoClose?: boolean;
  // 是否在点击地图时关闭
  closeOnClick?: boolean;
  // 偏移量
  offset?: { x: number; y: number };
}
