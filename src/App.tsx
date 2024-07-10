import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/menu/Dashboard';
import { ConfigProvider, App as AntdApp } from 'antd'; // Importa el componente App de Ant Design
import Files from './pages/menu/Files';
import FolderView from './components/FolderView';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#198754', // Verde que solicitaste
          borderRadius: 8,

          // Alias Token
          colorBgContainer: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <AntdApp> {/* Envuelve tu aplicación en el componente App de Ant Design */}
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/my-files" element={<Dashboard />} />
           
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
