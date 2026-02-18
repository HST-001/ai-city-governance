import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Alert,
  Layout,
} from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph, Link: AntdLink } = Typography;
const { Content } = Layout;

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onFinish = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => {
    setError(null);
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    try {
      await register(values.username, values.email, values.password, values.phone);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || '注册失败，请稍后再试'
      );
    }
  };

  return (
    <Layout className="min-h-screen">
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
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
              注册新账号
            </Title>
            <Paragraph type="secondary" style={{ textAlign: 'center' }}>
              加入街道更新维护治理系统
            </Paragraph>
          </div>

          {error && (
            <Alert
              message="注册失败"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            name="register"
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
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' },
              ]}
              label="邮箱"
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="请输入邮箱"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                { required: false },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' },
              ]}
              label="手机号码（选填）"
            >
              <Input
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                placeholder="请输入手机号码"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码长度至少为6位!' },
              ]}
              label="密码"
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入密码"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '请确认密码!' },
                { min: 6, message: '密码长度至少为6位!' },
              ]}
              label="确认密码"
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请再次输入密码"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                注册
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              已有账号? <AntdLink onClick={() => navigate('/login')}>登录</AntdLink>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;