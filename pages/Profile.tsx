import React from 'react';
import { Card, Empty } from 'antd';

interface ProfileProps {}

const Profile: React.FC<ProfileProps> = () => {
  return (
    <div className="profile-container">
      <Card title="个人资料">
        <Empty description="个人资料组件"></Empty>
      </Card>
    </div>
  );
};

export default Profile;