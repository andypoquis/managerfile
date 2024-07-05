import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/login/Login';
import Dashboard from './pages/menu/Dashboard.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './index.css';

const Main: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard/*"  element={isAuthenticated ? <Navigate to="/login" /> : <Dashboard />} />
        <Route path="/home" element={<ProtectedRoute />}>
          <Route path="/home" element={<App />} />
        </Route>
      </Routes>
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);
