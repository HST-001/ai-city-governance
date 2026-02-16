import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, Spin, Select, Space, Typography, Tag, Button } from 'antd';
import { EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import '../components/MapComponent.css';
import completeAddressData from '../data/addressData';

const { Title, Text } = Typography;
const { Option } = Select;

interface AddressOption {
  value: string;
  label: string;
  children?: AddressOption[];
}

interface StreetData {
  id: number;
  name: string;
  rating: number;
  province: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
}

const MapView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [streetData, setStreetData] = useState<StreetData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedStreet, setSelectedStreet] = useState<string>('');
  const [cities, setCities] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [streets, setStreets] = useState<AddressOption[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const municipalities = ['北京', '天津', '上海', '重庆', '香港', '澳门'];

  useEffect(() => {
    fetchStreetData();
  }, []);

  const fetchStreetData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/api/streets/ratings');
      const data = await response.json();
      
      if (data.success && data.data) {
        setStreetData(data.data);
      } else {
        setStreetData(generateMockData());
      }
    } catch (error) {
      console.error('获取街道数据失败:', error);
      setStreetData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): StreetData[] => {
    const mockStreets: StreetData[] = [];
    
    completeAddressData.forEach(province => {
      if (province.children) {
        province.children.forEach(city => {
          if (city.children) {
            city.children.forEach(district => {
              if (district.children) {
                district.children.forEach(street => {
                  mockStreets.push({
                    id: mockStreets.length + 1,
                    name: street.label,
                    rating: Math.floor(Math.random() * 2) + 3,
                    province: province.label,
                    city: city.label,
                    district: district.label,
                    lat: 39.9 + (Math.random() - 0.5) * 10,
                    lng: 116.4 + (Math.random() - 0.5) * 20,
                  });
                });
              }
            });
          }
        });
      }
    });
    
    return mockStreets.slice(0, 50);
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#73d13d';
    if (rating >= 3.5) return '#faad14';
    if (rating >= 3.0) return '#fa8c16';
    return '#ff4d4f';
  };

  const getRatingLevel = (rating: number): string => {
    if (rating >= 4.5) return '优秀';
    if (rating >= 4.0) return '良好';
    if (rating >= 3.5) return '中等';
    if (rating >= 3.0) return '及格';
    return '不及格';
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedStreet('');
    
    const selectedProvinceData = completeAddressData.find(item => item.value === value);
    if (selectedProvinceData && selectedProvinceData.children) {
      if (municipalities.includes(value)) {
        const cityLabel = selectedProvinceData.label;
        const cityValue = selectedProvinceData.value;
        const cityChildren = selectedProvinceData.children[0]?.children || [];
        setDistricts(cityChildren);
        setCities([{ 
          value: cityValue, 
          label: cityLabel, 
          children: cityChildren 
        }]);
      } else {
        setCities(selectedProvinceData.children);
        setDistricts([]);
      }
    } else {
      setCities([]);
      setDistricts([]);
      setStreets([]);
    }
    setStreets([]);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict('');
    setSelectedStreet('');
    
    const selectedCityData = cities.find(item => item.value === value);
    if (selectedCityData && selectedCityData.children) {
      setDistricts(selectedCityData.children);
    } else {
      setDistricts([]);
    }
    setStreets([]);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedStreet('');
    
    const selectedDistrictData = districts.find(item => item.value === value);
    if (selectedDistrictData && selectedDistrictData.children) {
      setStreets(selectedDistrictData.children);
    } else {
      setStreets([]);
    }
  };

  const handleStreetChange = (value: string) => {
    setSelectedStreet(value);
  };

  const filteredData = streetData.filter(street => {
    if (selectedProvince && street.province !== selectedProvince) return false;
    if (selectedCity && street.city !== selectedCity) return false;
    if (selectedDistrict && street.district !== selectedDistrict) return false;
    if (selectedStreet && street.name !== selectedStreet) return false;
    return true;
  });

  const uniqueProvinces = completeAddressData.map(item => ({ value: item.value, label: item.label }));

  const MapViewContent: React.FC<{ data: StreetData[]; mapType: 'standard' | 'satellite' }> = ({ data, mapType }) => {
    const map = useMap();
    
    useEffect(() => {
      if (data.length > 0) {
        const bounds = L.latLngBounds(data.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [data, map]);

    return (
      <>
        <TileLayer
          attribution='&copy; 高德地图'
          url={mapType === 'standard' 
            ? "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            : "http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
          }
          subdomains={['1', '2', '3', '4']}
        />
        {data.map((street) => (
          <Marker
            key={street.id}
            position={[street.lat, street.lng]}
          >
            <Popup>
              <div className="map-popup">
                <h3>{street.name}</h3>
                <p><strong>评级：</strong> {street.rating.toFixed(1)} 分</p>
                <p><strong>等级：</strong> {getRatingLevel(street.rating)}</p>
                <p><strong>位置：</strong> {street.province} {street.city} {street.district}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </>
    );
  };

  const MapControl: React.FC<{ mapType: 'standard' | 'satellite'; onMapTypeChange: (type: 'standard' | 'satellite') => void }> = ({ mapType, onMapTypeChange }) => {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        padding: '4px',
        borderRadius: '4px',
        backgroundColor: 'white',
        border: '2px solid rgba(0, 0, 0, 0.2)',
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.65)'
      }}>
        <Button
          type="text"
          icon={mapType === 'standard' ? <GlobalOutlined style={{ fontSize: '16px', color: '#333' }} /> : <EnvironmentOutlined style={{ fontSize: '16px', color: '#333' }} />}
          onClick={() => onMapTypeChange(mapType === 'standard' ? 'satellite' : 'standard')}
          size="small"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            padding: '0',
            borderRadius: '2px',
            border: 'none',
            backgroundColor: 'transparent'
          }}
        />
      </div>
    );
  };

  return (
    <div className="map-view-container">
      <Card title="地图视图">
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          <Title level={5}>筛选条件</Title>
          <Space wrap>
            <Select
              placeholder="选择省份"
              style={{ width: 150 }}
              allowClear
              onChange={handleProvinceChange}
              value={selectedProvince}
            >
              {uniqueProvinces.map(province => (
                <Option key={province.value} value={province.value}>{province.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="选择城市"
              style={{ width: 150 }}
              allowClear
              onChange={handleCityChange}
              value={selectedCity}
              disabled={!selectedProvince || cities.length === 0}
            >
              {cities.map(city => (
                <Option key={city.value} value={city.value}>{city.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="选择区县"
              style={{ width: 150 }}
              allowClear
              onChange={handleDistrictChange}
              value={selectedDistrict}
              disabled={!selectedCity || districts.length === 0}
            >
              {districts.map(district => (
                <Option key={district.value} value={district.value}>{district.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="选择街道"
              style={{ width: 150 }}
              allowClear
              onChange={handleStreetChange}
              value={selectedStreet}
              disabled={!selectedDistrict || streets.length === 0}
            >
              {streets.map(street => (
                <Option key={street.value} value={street.value}>{street.label}</Option>
              ))}
            </Select>
          </Space>
        </Space>

        <Spin spinning={loading}>
          <div style={{ height: '600px', width: '100%', position: 'relative' }}>
            {filteredData.length > 0 ? (
              <>
                <MapControl mapType={mapType} onMapTypeChange={setMapType} />
                <MapContainer
                  center={[39.9, 116.4]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <MapViewContent data={filteredData} mapType={mapType} />
                </MapContainer>
              </>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <Text type="secondary">暂无街道数据</Text>
              </div>
            )}
          </div>
        </Spin>

        <div style={{ marginTop: '16px' }}>
          <Title level={5}>图例</Title>
          <Space wrap>
            <Tag color="#52c41a">优秀 (4.5分以上)</Tag>
            <Tag color="#73d13d">良好 (4.0-4.5分)</Tag>
            <Tag color="#faad14">中等 (3.5-4.0分)</Tag>
            <Tag color="#fa8c16">及格 (3.0-3.5分)</Tag>
            <Tag color="#ff4d4f">不及格 (3.0分以下)</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default MapView;