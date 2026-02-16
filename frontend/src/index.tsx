import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('前端应用开始初始化...');

// 创建React根节点并渲染应用
try {
  console.log('尝试获取root DOM元素...');
  const rootElement = document.getElementById('root');
  console.log('root DOM元素:', rootElement ? '找到' : '未找到');
  
  if (rootElement) {
    console.log('创建React根节点...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('React根节点创建成功，开始渲染应用...');
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('应用渲染完成！');
  } else {
    console.error('错误：无法找到root DOM元素，应用无法挂载');
  }
} catch (error) {
  console.error('应用初始化过程中发生错误:', error);
}