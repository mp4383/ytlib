import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { DownloadOutlined, FolderOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Download from './views/Download';
import Library from './views/Library';

const { Sider, Content } = Layout;

// Wrapper component to handle active menu item
function AppContent() {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DownloadOutlined />,
      label: <Link to="/">Download</Link>,
    },
    {
      key: '/library',
      icon: <FolderOutlined />,
      label: <Link to="/library">Library</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          YTLib
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : '/library']}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: 200, minHeight: '100vh' }}>
        <Content style={{ margin: '24px', overflow: 'initial' }}>
          <Routes>
            <Route path="/" element={<Download />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
