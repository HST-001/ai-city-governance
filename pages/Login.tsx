import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Alert,
} from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph, Link: AntdLink } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      console.log('Login: 提交登录请求', { username: values.username });
      const success = await login(values.username, values.password);
      if (success) {
        console.log('Login: 登录成功，跳转至dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login: 登录失败，用户名或密码不正确');
        setError('登录失败，请检查用户名和密码');
      }
    } catch (err: any) {
      console.error('Login: 登录异常', err);
      setError(
        err.response?.data?.message || '登录过程中发生错误，请稍后重试'
      );
    } finally {
      setLoading(false);
    }
  };

  console.log('Login: 渲染登录页面组件');
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8, textAlign: 'center' }}>
            欢迎登录
          </Title>
          <Paragraph type="secondary" style={{ textAlign: 'center' }}>
            街道更新维护治理系统
          </Paragraph>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
            label="用户名"
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="请输入用户名"
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
            label="密码"
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账号? <AntdLink onClick={() => navigate('/register')}>注册</AntdLink>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

