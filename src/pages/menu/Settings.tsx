import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import pb from '../../pocketbase';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    // Obtener el usuario desde el almacenamiento local
    const userRecord = JSON.parse(localStorage.getItem('userRecord') || '{}');
    if (userRecord && userRecord.id) {
      setUser(userRecord);
      // Inicializar el formulario con los datos del usuario
      form.setFieldsValue({
        username: userRecord.username,
        email: userRecord.email,
        name: userRecord.name,
        rol: userRecord.rol,
      });
    }

    // Obtener los roles desde PocketBase
    const fetchRoles = async () => {
      try {
        const roleRecords = await pb.collection('roles').getFullList({ sort: '-created' });
        setRoles(roleRecords.map((role: any) => ({ id: role.id, name: role.name })));
      } catch (error) {
        message.error('Error al cargar los roles: ' + (error as Error).message);
      }
    };

    fetchRoles();
  }, [form]);

  const handleUpdate = async (values: any) => {
    setLoading(true);

    const data = new FormData();
    data.append('username', values.username);
    data.append('emailVisibility', values.emailVisibility);
    data.append('name', values.name);
    data.append('rol', values.rol);
    data.append('oldPassword', values.oldPassword);

    // Solo incluir la nueva contraseña si se ha proporcionado
    if (values.password) {
      data.append('password', values.password);
      data.append('passwordConfirm', values.passwordConfirm);
    }

    // Incluir la nueva foto de perfil si se ha seleccionado
    if (fileList.length > 0 && fileList[0].originFileObj instanceof Blob) {
      data.append('avatar', fileList[0].originFileObj, fileList[0].name);
    }

    try {
      await pb.collection('users').update(user.id, data);
      message.success('Datos actualizados exitosamente');
      // Actualizar el usuario en el almacenamiento local
      const updatedUser = { ...user, ...Object.fromEntries(data.entries()) };
      localStorage.setItem('userRecord', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      message.error('Error al actualizar los datos: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Configuración</h1>
      <Form form={form} onFinish={handleUpdate} layout="vertical">
        <Form.Item name="username" label="Nombre de usuario" rules={[{ required: true, message: 'Por favor ingrese su nombre de usuario' }]}>
          <Input placeholder="Nombre de usuario" />
        </Form.Item>
        <Form.Item name="email" label="Correo electrónico" rules={[{ required: true, message: 'Por favor ingrese su correo electrónico' }]}>
          <Input placeholder="Correo electrónico" disabled />
        </Form.Item>
        <Form.Item name="name" label="Nombre completo" rules={[{ required: true, message: 'Por favor ingrese su nombre completo' }]}>
          <Input placeholder="Nombre completo" />
        </Form.Item>
        <Form.Item name="rol" label="Rol" rules={[{ required: true, message: 'Por favor seleccione su rol' }]}>
          <Select placeholder="Seleccione su rol">
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="avatar" label="Foto de perfil">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Seleccionar foto</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="oldPassword" label="Contraseña actual" rules={[{ required: true, message: 'Por favor ingrese su contraseña actual' }]}>
          <Input.Password placeholder="Contraseña actual" />
        </Form.Item>
        <Form.Item name="password" label="Nueva contraseña" rules={[{ min: 8, message: 'La nueva contraseña debe tener al menos 8 caracteres' }]}>
          <Input.Password placeholder="Nueva contraseña" />
        </Form.Item>
        <Form.Item name="passwordConfirm" label="Confirmar nueva contraseña" dependencies={['password']} rules={[
          { required: form.getFieldValue('password') !== undefined, message: 'Por favor confirme su nueva contraseña' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Las contraseñas no coinciden'));
            },
          }),
        ]}>
          <Input.Password placeholder="Confirmar nueva contraseña" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Actualizar datos
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
