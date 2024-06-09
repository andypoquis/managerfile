import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigProvider, Form, Input, Button, message } from 'antd';
import pb from '../../pocketbase'; // Asegúrate de que esta ruta es correcta
import 'tailwindcss/tailwind.css'; // Importa los estilos de Tailwind CSS
import './custom.css'; // Importa los estilos personalizados

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      console.log('Autenticando usuario:', values.username);
      const authData = await pb.collection('users').authWithPassword(values.username, values.password);
      message.success('Inicio de sesión exitoso');
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userRecord', JSON.stringify(authData.record));
      console.log(authData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      message.error('Error al iniciar sesión: ' + (error as Error).message);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <img src="https://ogc.unsm.edu.pe/src/img/default/logo_ogc_unsm.svg" alt="Logo Universidad Nacional de San Martín" className="h-20" />
          </div>
          <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Iniciar Sesión</h1>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            layout="vertical"
          >
            <Form.Item
              label="Usuario"
              name="username"
              rules={[{ required: true, message: 'Por favor ingrese su usuario' }]}
            >
              <Input
                placeholder="Ingrese su usuario"
                className="py-3 px-4 rounded text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                style={{ height: '40px' }}
              />
            </Form.Item>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
            >
              <Input.Password
                placeholder="Ingrese su contraseña"
                className="py-3 px-4 rounded text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ height: '40px' }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded"
                style={{ height: '40px' }}
              >
                Ingresar
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
