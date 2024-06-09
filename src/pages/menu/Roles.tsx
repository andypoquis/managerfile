// src/pages/roles/Roles.tsx
import React, { useEffect, useState } from 'react';
import { List, message, Card, Button, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import pb from '../../pocketbase';
import RoleModal from '../../components/RoleModal';

interface RoleRecord {
  id: string;
  collectionId: string;
  created: string;
  updated: string;
  name: string;
  description: string;
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await pb.collection('roles').getFullList();
        const mappedRoles = result.map((record: any) => ({
          id: record.id,
          collectionId: record.collectionId,
          created: record.created,
          updated: record.updated,
          name: record.name,
          description: record.description,
        }));
        setRoles(mappedRoles);
      } catch (error) {
        message.error('Error al cargar los roles: ' + (error as Error).message);
      }
    };

    fetchRoles();

    const handleRealtimeRoleChanges = (e: { action: string; record: RoleRecord }) => {
      message.info(`Rol ${e.action}: ${e.record.name}`);
      if (e.action === 'create') {
        setRoles(prevRoles => [e.record, ...prevRoles]);
      } else if (e.action === 'update') {
        setRoles(prevRoles => prevRoles.map(role => (role.id === e.record.id ? e.record : role)));
      } else if (e.action === 'delete') {
        setRoles(prevRoles => prevRoles.filter(role => role.id !== e.record.id));
      }
    };

    pb.collection('roles').subscribe('*', handleRealtimeRoleChanges);

    return () => {
      pb.collection('roles').unsubscribe('*');
    };
  }, []);

  const handleEditRole = (role: RoleRecord) => {
    setSelectedRole(role);
    setRoleModalVisible(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await pb.collection('roles').delete(roleId);
      message.success('Rol eliminado exitosamente');
    } catch (error) {
      message.error('Error al eliminar el rol: ' + (error as Error).message);
    }
  };

  return (
    <div className="roles-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Gestión de Roles</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedRole(null);
            setRoleModalVisible(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          Crear Rol
        </Button>
      </div>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={roles}
        renderItem={role => (
          <List.Item>
            <Card
              actions={[
                <EditOutlined key="edit" onClick={() => handleEditRole(role)} />,
                <DeleteOutlined key="delete" onClick={() => handleDeleteRole(role.id)} />,
              ]}
            >
              <Card.Meta
                title={role.name}
                description={role.description}
              />
            </Card>
          </List.Item>
        )}
      />
      <RoleModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        role={selectedRole}
      />
    </div>
  );
};

export default Roles;