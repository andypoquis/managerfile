import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/menu/Dashboard';
import { ConfigProvider } from 'antd';

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
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-files" element={<Dashboard />} />
          <Route path="/shared" element={<Dashboard />} />
          <Route path="/recent" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
