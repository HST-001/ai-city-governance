import React, { useState } from 'react';
import { Upload, Form, Select, Input, Button, message, Card, Space, Typography, Row, Col } from 'antd';
import { InboxOutlined, CameraOutlined } from '@ant-design/icons';
import { UploadProps, UploadFile } from 'antd';
import completeAddressData from '../data/addressData';
import { batchUploadPhotosToServer } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义地址选项接口
export interface AddressOption {
  value: string;
  label: string;
  children?: AddressOption[];
}

interface ProblemPhoto {
  uid: string;
  name: string;
  status: string;
  url?: string;
  thumbUrl?: string;
  originFileObj?: File;
}

const PhotoUpload: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [cities, setCities] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [streets, setStreets] = useState<AddressOption[]>([]);
  const [photoType, setPhotoType] = useState<string>('other');

  const typeOptions = [
    { value: 'shop_sign_building', label: '店招/建筑' },
    { value: 'greenery', label: '绿化' },
    { value: 'sidewalk', label: '人行道' },
    { value: 'bike_lane', label: '自行车道' },
    { value: 'urban_facilities', label: '城市设施/家具' },
    { value: 'other', label: '综合' },
  ];

  // 定义直辖市和特别行政区列表
  const municipalities = ['北京', '天津', '上海', '重庆', '香港', '澳门'];

  // 处理省份选择
  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity('');
    setDistrict('');
    setStreet('');
    
    // 查找选中省份的城市列表
    const selectedProvince = completeAddressData.find(item => item.value === value);
    if (selectedProvince && selectedProvince.children) {
      if (municipalities.includes(value)) {
        // 如果是直辖市或特别行政区
        // 直接使用省份作为城市
        const cityLabel = selectedProvince.label;
        const cityValue = selectedProvince.value;
        
        // 设置城市值
        setCity(cityValue);
        
        // 获取城市的children（区县数据）
        const cityChildren = selectedProvince.children[0]?.children || [];
        
        // 设置区县数据
        setDistricts(cityChildren);
        
        // 设置城市列表（只包含一个城市，即直辖市/特别行政区本身）
        setCities([{ 
          value: cityValue, 
          label: cityLabel, 
          children: cityChildren 
        }]);
        
        // 更新表单值，自动选择城市
        form.setFieldsValue({ 
          city: cityValue, 
          district: '', 
          street: '' 
        });
      } else {
        // 普通省份
        setCities(selectedProvince.children);
        setDistricts([]);
        
        // 更新表单值
        form.setFieldsValue({ 
          city: '', 
          district: '', 
          street: '' 
        });
      }
    } else {
      setCities([]);
      setDistricts([]);
      setStreets([]);
      
      // 更新表单值
      form.setFieldsValue({ 
        city: '', 
        district: '', 
        street: '' 
      });
    }
    setStreets([]);
  };

  // 处理城市选择
  const handleCityChange = (value: string) => {
    setCity(value);
    setDistrict('');
    setStreet('');
    
    // 查找选中城市的区县列表
    const selectedCity = cities.find(item => item.value === value);
    if (selectedCity && selectedCity.children) {
      setDistricts(selectedCity.children);
    } else {
      setDistricts([]);
    }
    setStreets([]);
    
    // 更新表单值
    form.setFieldsValue({ district: '', street: '' });
  };

  // 处理区县选择
  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setStreet('');
    
    // 查找选中区县的街道列表
    const selectedDistrict = districts.find(item => item.value === value);
    if (selectedDistrict && selectedDistrict.children) {
      setStreets(selectedDistrict.children);
    } else {
      setStreets([]);
    }
    
    // 更新表单值
    form.setFieldsValue({ street: '' });
  };

  // 处理街道选择
  const handleStreetChange = (value: string) => {
    setStreet(value);
  };

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    console.log('beforeUpload被调用，文件:', file);
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只支持 JPG 或 PNG 格式的图片!');
    }
    const isLessThan200M = file.size / 1024 / 1024 < 200;
    if (!isLessThan200M) {
      message.error('图片大小必须小于 200MB!');
    }
    console.log('文件验证结果:', { isJpgOrPng, isLessThan200M });
    return false;
  };

  // 处理文件上传变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    console.log('handleChange被调用，新文件列表:', newFileList);
    console.log('文件数量:', newFileList.length);
    setFileList(newFileList);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      console.log('=== handleSubmit开始 ===');
      const values = await form.validateFields();
      console.log('表单验证通过，值:', values);
      
      console.log('当前fileList状态:', fileList);
      console.log('fileList长度:', fileList.length);
      
      if (fileList.length === 0) {
        message.error('请至少上传一张问题照片');
        return;
      }
      
      // 将文件列表转换为File数组
      const files = fileList
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj as File);
      
      console.log('过滤后的文件数组:', files);
      console.log('文件数组长度:', files.length);
      
      if (files.length === 0) {
        message.error('没有有效的文件可以上传');
        return;
      }
      
      // 调用批量上传API，传递位置信息
      console.log('准备调用API，位置信息:', {
        province: values.province || '',
        city: values.city || '',
        district: values.district || '',
        street: values.street || '',
        detailedLocation: values.detailedLocation || '',
        description: values.description || '',
        photoType: values.photoType || 'other'
      });
      
      const result = await batchUploadPhotosToServer(files, {
        province: values.province || '',
        city: values.city || '',
        district: values.district || '',
        street: values.street || '',
        detailedLocation: values.detailedLocation || '',
        description: values.description || '',
        photoType: values.photoType || 'other'
      });
      
      console.log('API调用结果:', result);
      
      if (result.success) {
        message.success('照片上传成功！');
        
        // 重置表单和文件列表
        form.resetFields();
        setFileList([]);
        setProvince('');
        setCity('');
        setDistrict('');
        setStreet('');
        setCities([]);
        setDistricts([]);
        setStreets([]);
      } else {
        message.error(result.message || '上传失败，请重试');
      }
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('表单提交失败，请检查输入');
    }
  };

  // 自定义上传组件
  const uploadButton = (
    <div>
      <CameraOutlined />
      <p className="ant-upload-text">上传照片</p>
    </div>
  );

  return (
    <div className="photo-upload-container">
      <Title level={4}>照片上传</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            console.log('=== Form.onFinish被调用 ===');
            console.log('表单值:', values);
            await handleSubmit();
          }}
        >
          <Form.Item
            name="photos"
            label="照片"
            rules={[{ required: true, message: '请上传照片' }]}
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
          >
            <Upload.Dragger
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              multiple
            >
              <Space size="small" direction="vertical" style={{ padding: '2px 0' }}>
                <InboxOutlined style={{ fontSize: '24px' }} />
                <p className="ant-upload-drag-icon" style={{ margin: '3px 0', fontSize: '12px' }}>
                  点击或拖拽文件到此区域上传
                </p>
                <p className="ant-upload-text" style={{ margin: '2px 0', fontSize: '10px' }}>
                  支持单个或批量上传
                </p>
                <p className="ant-upload-hint" style={{ margin: '2px 0', fontSize: '10px' }}>
                  请上传 JPG 或 PNG 格式的图片，大小不超过 200MB
                </p>
              </Space>
            </Upload.Dragger>
          </Form.Item>

          <Text strong>位置：</Text>
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Form.Item
                name="province"
                label="省份"
                rules={[{ required: true, message: '请选择省份' }]}
              >
                <Select
                  placeholder="请选择省份"
                  style={{ width: '100%' }}
                  onChange={handleProvinceChange}
                  value={province}
                >
                  {completeAddressData.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="city"
                label="城市"
                rules={[{ required: true, message: '请选择城市' }]}
              >
                <Select
                  placeholder="请选择城市"
                  style={{ width: '100%' }}
                  onChange={handleCityChange}
                  value={city}
                  disabled={!province || cities.length === 1} // 当只有一个城市选项时，禁用选择框
                  defaultValue={cities.length === 1 ? cities[0].value : undefined} // 当只有一个城市选项时，默认选中
                >
                  {cities.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="district"
                label="区县"
                rules={[{ required: true, message: '请选择区县' }]}
              >
                <Select
                  placeholder="请选择区县"
                  style={{ width: '100%' }}
                  onChange={handleDistrictChange}
                  value={district}
                  disabled={!city}
                >
                  {districts.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="street"
                label="街道乡镇"
                rules={[{ required: true, message: '请选择街道乡镇' }]}
              >
                <Select
                  placeholder="请选择街道乡镇"
                  style={{ width: '100%' }}
                  onChange={handleStreetChange}
                  value={street}
                  disabled={!district}
                >
                  {streets.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="detailedLocation"
            label="详细地址"
          >
            <Input placeholder="请输入详细地址信息" />
          </Form.Item>

          <Form.Item
            name="photoType"
            label="照片类型"
            initialValue="other"
          >
            <Select
              placeholder="请选择照片类型"
              style={{ width: '100%' }}
              onChange={(value) => setPhotoType(value)}
              value={photoType}
            >
              {typeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="备注信息"
          >
            <TextArea
              rows={4}
              placeholder="备注信息"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large"
              disabled={fileList.length === 0 || !province || !city || !district || !street}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PhotoUpload;