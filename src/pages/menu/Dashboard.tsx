import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, Dropdown, Space, Badge, Input, List } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  FileOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ShareAltOutlined,
  SafetyOutlined,
  BellOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css'; // Importa los estilos de Tailwind CSS
import './custom.css'; // Importa los estilos personalizados
import DashboardContent from './DashboardContent';
import Files from './Files';
import Shared from './Shared';
import ManageUsers from './ManageUsers';
import Roles from './Roles';
import Settings from './Settings';
import AddFile from './AddFile';
import FolderView from '../../components/FolderView';
import pb from '../../pocketbase';

const { Header, Sider, Content } = Layout;
const { Search } = Input;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el usuario desde el almacenamiento local
    const userRecord = JSON.parse(localStorage.getItem('userRecord') || '{}');
    if (userRecord && userRecord.id) {
      // Obtener el avatar del usuario desde PocketBase
      const avatarUrl = `https://pocketbase-production-451f.up.railway.app/api/files/_pb_users_auth_/${userRecord.id}/${userRecord.avatar}?token=${pb.authStore.token}`;
      setAvatarUrl(avatarUrl);
    }
  }, []);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="0">
        <Link to="/profile">Perfil</Link>
      </Menu.Item>
      <Menu.Item key="1">
        <Link to="/settings">Configuración</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  const notifications = [
    {
      key: '1',
      message: 'Archivo subido',
      description: 'Juan Pérez subió un archivo',
      datetime: '2024-06-01 12:34',
    },
    {
      key: '2',
      message: 'Archivo compartido',
      description: 'María Gómez compartió un archivo',
      datetime: '2024-06-01 14:21',
    },
    {
      key: '3',
      message: 'Archivo eliminado',
      description: 'Carlos López eliminó un archivo',
      datetime: '2024-06-01 16:45',
    },
  ];

  const notificationMenu = (
    <div style={{ width: '300px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <List
        dataSource={notifications}
        renderItem={item => (
          <List.Item key={item.key}>
            <List.Item.Meta
              title={<span>{item.message}</span>}
              description={
                <div>
                  <div>{item.description}</div>
                  <div className="text-gray-500 text-sm">{item.datetime}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="h-auto overflow-auto"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', width: '15vw' }}
      >
        <div className="logo text-center py-6">
          <img src="https://univerperu.com/wp-content/uploads/2023/07/Universidad-Nacional-de-San-Martin-UNSM.png" alt="Logo" className="h-10 mx-auto" />
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          className="custom-menu flex-1 flex flex-col"
          style={{ width: '4.5rem' }}
        >
          <Menu.Item key="1" icon={<HomeOutlined />} className="custom-menu-item flex-1">
            <Link to="/dashboard" className="text-gray-700 w-full flex items-center">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<FileOutlined />} className="custom-menu-item flex-1">
            <Link to="/dashboard/files" className="text-gray-700 w-full flex items-center">Administrador de archivos</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ShareAltOutlined />} className="custom-menu-item flex-1">
            <Link to="/dashboard/shared" className="text-gray-700 w-full flex items-center">Compartidos</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="4" icon={<UserOutlined />} className="custom-menu-item flex-1">
            <Link to="/dashboard/manage-users" className="text-gray-700 w-full flex items-center">Gestionar Usuario</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<SafetyOutlined />} className="custom-menu-item flex-1">
            <Link to="/dashboard/roles" className="text-gray-700 w-full flex items-center">Roles</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<SettingOutlined/>} className="custom-menu-item flex-1">
            <Link to="/dashboard/settings" className="text-gray-700 w-full flex items-center">Configuración</Link>
          </Menu.Item>
          <Menu.Item key="8" icon={<LogoutOutlined />} className="custom-menu-item flex-1 custom-menu-item-logout" onClick={handleLogout}>
            Cerrar sesión
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className="flex justify-between items-center px-4 custom-header"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggle}
              className="text-gray-700 hover:text-green-500"
            />
            <Search placeholder="Buscar" className="ml-4" />
          </div>
          <div className="flex items-center space-x-4">
            <Dropdown overlay={notificationMenu} trigger={['click']}>
              <Badge count={5}>
                <BellOutlined className="text-gray-700" />
              </Badge>
            </Dropdown>
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Avatar size="large" src={avatarUrl} className="cursor-pointer" />
            </Dropdown>
          </div>
        </Header>
        <Content className="site-layout-background h-auto" style={{ margin: '24px 16px', padding: 24, backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '16px', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/add-file" element={<AddFile />} />
            <Route path="/files" element={<Files />} />
            <Route path="/files/:folderName" element={<FolderView />} /> {/* Ruta dinámica */}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
