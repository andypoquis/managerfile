import React, { useEffect, useState } from 'react';
import { List, Button, message, Avatar, Modal, Form, Input, Select, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, UploadOutlined } from '@ant-design/icons';
import pb from '../../pocketbase';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  emailVisibility: boolean;
  name: string;
  avatar: string;
  rol: string;
}

interface RoleRecord {
  id: string;
  name: string;
  description: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const userResult = await pb.collection('users').getFullList();
        const roleResult = await pb.collection('roles').getFullList();

        setUsers(userResult.map((record: any) => ({
          id: record.id,
          username: record.username,
          email: record.email,
          emailVisibility: true,
          name: record.name,
          avatar: record.avatar,
          rol: record.rol,
        })));

        setRoles(roleResult.map((record: any) => ({
          id: record.id,
          name: record.name,
          description: record.description,
        })));
      } catch (error) {
        message.error('Error al cargar los usuarios y roles: ' + (error as Error).message);
      }
    };

    fetchUsersAndRoles();

    const handleRealtimeChanges = (e: { action: string; record: UserRecord }) => {
      message.info(`Usuario ${e.action}: ${e.record.username}`);
      if (e.action === 'create') {
        setUsers(prevUsers => [e.record, ...prevUsers]);
      } else if (e.action === 'update') {
        setUsers(prevUsers => prevUsers.map(user => (user.id === e.record.id ? e.record : user)));
      } else if (e.action === 'delete') {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== e.record.id));
      }
    };

    pb.collection('users').subscribe('*', handleRealtimeChanges);

    return () => {
      pb.collection('users').unsubscribe('*');
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('users').delete(id);
      message.success('Usuario eliminado exitosamente');
    } catch (error) {
      message.error('Error al eliminar el usuario: ' + (error as Error).message);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setUserModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('name', values.name);
      formData.append('rol', values.rol);

      if (values.avatar && values.avatar.fileList && values.avatar.fileList[0]) {
        formData.append('avatar', values.avatar.fileList[0].originFileObj);
      }

      if (selectedUser) {
        await pb.collection('users').update(selectedUser.id, formData);
        message.success('Usuario actualizado exitosamente');
      } else {
        formData.append('password', values.password);
        formData.append('passwordConfirm', values.passwordConfirm);
        await pb.collection('users').create(formData);
        message.success('Usuario creado exitosamente');
      }
      setUserModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error al guardar el usuario: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Gestionar Usuarios</h1>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        className="mb-4"
        onClick={handleNewUser}
      >
        Nuevo Usuario
      </Button>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={user => (
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => handleEdit(user)}>Editar</Button>,
                <Button icon={<DeleteOutlined />} onClick={() => handleDelete(user.id)}>Eliminar</Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={`https://pocketbase-production-451f.up.railway.app/api/files/_pb_users_auth_/${user.id}/${user.avatar}`} />}
                title={user.name}
                description={`${user.email} - ${roles.find(role => role.id === user.rol)?.name || 'Sin rol'}`}
              />
            </List.Item>
          )}
        />
      </div>
      <Modal
        visible={userModalVisible}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form form={form} initialValues={selectedUser || undefined} onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="Nombre de Usuario"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="Ingrese el nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[{ required: true, message: 'Por favor ingrese el correo electrónico' }]}
          >
            <Input placeholder="Ingrese el correo electrónico" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingrese el nombre completo' }]}
          >
            <Input placeholder="Ingrese el nombre completo" />
          </Form.Item>
          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
          >
            <Select placeholder="Seleccione un rol">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="avatar"
            label="Foto de Perfil"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload name="avatar" listType="picture" beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Seleccionar Foto</Button>
            </Upload>
          </Form.Item>
          {!selectedUser && (
            <>
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Por favor ingrese la contraseña' }]}
              >
                <Input.Password placeholder="Ingrese la contraseña" />
              </Form.Item>
              <Form.Item
                name="passwordConfirm"
                label="Confirmar Contraseña"
                rules={[{ required: true, message: 'Por favor confirme la contraseña' }]}
              >
                <Input.Password placeholder="Confirme la contraseña" />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              {selectedUser ? 'Actualizar' : 'Crear'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
