import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Button, Typography, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from './hooks/useAuth';
import { Role } from './types/rolePermissions';

// 导入组件
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StreetEvaluation from './pages/StreetEvaluation';
import RatingHistoryPage from './pages/RatingHistoryPage';
import RatingComparisonPage from './pages/RatingComparisonPage';
import PhotoUpload from './pages/PhotoUpload';
import PhotoManagement from './pages/PhotoManagement';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import ModelTraining from './pages/ModelTraining';
import ModelConfig from './pages/ModelConfig';
import NotFound from './pages/NotFound';
import TestingGuide from './pages/TestingGuide';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// 导入样式 - 只导入存在的文件
import './index.css';
import './components/Layout.css';

const { Title, Text } = Typography;

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态，下次渲染将显示降级UI
    console.error('Error caught by ErrorBoundary (getDerivedStateFromError):', error);
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以在这里记录错误信息
    console.error('Error caught by ErrorBoundary (componentDidCatch):', error);
    console.error('Error stack trace:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 自定义降级UI
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Alert
            message="应用出错了"
            description={
              <div>
                <Text>请刷新页面或联系管理员</Text>
                {this.state.error && (
                  <div style={{ marginTop: '10px', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    <Text type="secondary">错误详情: {this.state.error.message}</Text>
                  </div>
                )}
              </div>
            }
            type="error"
            showIcon
            style={{ maxWidth: '600px', margin: '0 auto 20px' }}
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={this.handleRefresh}
          >
            刷新页面
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    console.log('App组件开始渲染');
    const { isAuthenticated, user, loading } = useAuth();
    
    console.log('App组件: 认证状态 - isAuthenticated:', isAuthenticated, 'loading:', loading);
    
    // 添加重定向日志
    useEffect(() => {
      console.log('App组件: 认证状态变化 - isAuthenticated:', isAuthenticated, 'user:', user, 'loading:', loading);
      console.log('App组件: 页面渲染信息 - 组件挂载');
      if (!loading) {
        console.log('App组件: 根路径重定向状态 - isAuthenticated:', isAuthenticated);
      }
    }, [isAuthenticated, user, loading]);

    // 如果正在加载认证状态，显示加载中
    if (loading) {
      console.log('App组件: 正在加载认证状态');
      return <div className="loading-container">加载中...</div>;
    }

    console.log('App组件: 准备渲染路由');
    return (
      <div className="App">
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* 测试路由 - 绕过Layout组件直接验证路由功能 */}
              <Route path="/test-route" element={
                <div>
                  <h1>测试路由页面</h1>
                  <p>这是一个直接的测试路由，用于验证路由功能是否正常工作。</p>
                  <button onClick={() => window.location.pathname = '/dashboard'}>转到Dashboard</button>
                  <button onClick={() => window.location.pathname = '/photo-upload'}>转到照片上传</button>
                  <button onClick={() => window.location.pathname = '/map'}>转到地图视图</button>
                </div>
              } />
              
              {/* 原有的公共路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
  
              {/* 受保护的路由 */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* 嵌套路由内容 */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/street-evaluation" element={<StreetEvaluation />} />
                <Route path="/rating-history" element={<RatingHistoryPage />} />
                <Route path="/compare-ratings" element={<RatingComparisonPage />} />
                <Route path="/photo-upload" element={<PhotoUpload />} />
                <Route path="/photo-management" element={<PhotoManagement />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/model-training" element={<ModelTraining />} />
                <Route path="/model-configuration" element={<ModelConfig />} />
                <Route path="/testing-guide" element={<TestingGuide />} />
              </Route>
  
              {/* 404页面 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </div>
    );
  } catch (error) {
    console.error('App组件渲染错误:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>应用启动失败</h1>
        <p>发生了未预期的错误</p>
        <button onClick={() => window.location.reload()}>刷新页面</button>
      </div>
    );
  }
}

export default App;