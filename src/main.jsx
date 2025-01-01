import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import 'antd/dist/reset.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgBase: '#141414',
          colorBgContainer: '#1f1f1f',
          colorBgElevated: '#1f1f1f',
          colorBgLayout: '#141414',
        },
        components: {
          Layout: {
            siderBg: '#001529',
            headerBg: '#141414',
          },
          Menu: {
            darkItemBg: '#001529',
          },
          Card: {
            colorBgContainer: '#1f1f1f',
          },
          Modal: {
            contentBg: '#1f1f1f',
            headerBg: '#1f1f1f',
            titleColor: 'rgba(255, 255, 255, 0.85)',
          },
          Input: {
            colorBgContainer: '#141414',
            colorBorder: '#303030',
          },
          Button: {
            colorBgContainer: '#1f1f1f',
          }
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
