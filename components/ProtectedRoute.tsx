import React, { ReactNode } from 'react';
import { Alert, Spin, Typography, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { Role, Permission } from '../types/rolePermissions';

const { Title, Text, Paragraph } = Typography;

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRoles,
}) => {
  const { user, loading } = useAuth();
  const { canAccessPage, hasRole, getUserPermissionDescription } = usePermission();
  const navigate = useNavigate();

  // 如果还在加载用户信息，显示加载中状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" tip="正在验证身份..." />
        <Text style={{ marginTop: 16 }}>请稍候，正在检查您的访问权限</Text>
      </div>
    );
  }

  // 检查用户是否已登录
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        padding: 24
      }}>
        <div style={{ maxWidth: 500, width: '100%' }}>
          <Alert
            message="需要登录"
            description={
              <>
                <Paragraph>您需要登录系统才能访问此页面。</Paragraph>
                <Paragraph>请先登录后再尝试访问。</Paragraph>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/login')}
                  style={{ marginTop: 16 }}
                >
                  去登录
                </Button>
              </>
            }
            type="info"
            showIcon
            icon={<UserOutlined style={{ fontSize: 24 }} />}
          />
        </div>
      </div>
    );
  }

  // 使用增强的权限检查逻辑
  const hasAccess = canAccessPage(requiredRoles, requiredPermission);

  if (!hasAccess) {
    // 根据用户角色显示不同的无权限提示
    const getRoleName = (role: Role) => {
      switch(role) {
        case Role.ADMIN: return '管理员';
        case Role.DEVELOPER: return '开发人员';
        case Role.CLIENT: return '客户端用户';
        default: return role;
      }
    };

    // 构建所需角色的提示文本
    const requiredRolesText = requiredRoles?.map(getRoleName).join('或') || '';
    const roleHint = requiredRoles && requiredRoles.length > 0 
      ? `此功能仅对${requiredRolesText}开放`
      : '';

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        padding: 24
      }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <Alert
            message="权限不足"
            description={
              <>
                <Paragraph strong>抱歉，您没有权限访问此页面或功能。</Paragraph>
                {roleHint && <Paragraph type="secondary">{roleHint}</Paragraph>}
                <Paragraph type="secondary">
                  当前权限: {getUserPermissionDescription()}
                </Paragraph>
                {hasRole(Role.CLIENT) && (
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    如果您需要更多权限，请联系系统管理员申请角色提升。
                  </Paragraph>
                )}
                {hasRole(Role.DEVELOPER) && (
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    此功能需要管理员权限，如果您认为这是个错误，请联系系统管理员。
                  </Paragraph>
                )}
              </>
            }
            type="error"
            showIcon
            icon={<LockOutlined style={{ fontSize: 24 }} />}
          />
        </div>
      </div>
    );
  }

  // 用户有权限访问，渲染子组件
  return <>{children}</>;
};

// 添加默认导出以支持默认导入
export default ProtectedRoute;