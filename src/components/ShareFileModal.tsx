// src/components/ShareFileModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, List, Checkbox, message } from 'antd';
import pb from '../pocketbase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface ShareFileModalProps {
  visible: boolean;
  onClose: () => void;
  fileId: string;
  currentShared: string[];
}

const ShareFileModal: React.FC<ShareFileModalProps> = ({ visible, onClose, fileId, currentShared }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentShared);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList({ sort: '-created' });
        setUsers(records.map((record: any) => ({
          id: record.id,
          name: record.name,
          email: record.email,
          avatar: record.avatar,
        })));
      } catch (error) {
        message.error('Error al cargar los usuarios: ' + (error as Error).message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedUsers(currentShared);
  }, [currentShared]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleShare = async () => {
    try {
      await pb.collection('files').update(fileId, { shared: selectedUsers });
      message.success('Archivo compartido exitosamente');
      onClose();
    } catch (error) {
      message.error('Error al compartir el archivo: ' + (error as Error).message);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Compartir archivo"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancelar</Button>,
        <Button key="share" type="primary" onClick={handleShare}>Compartir</Button>,
      ]}
    >
      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={user => (
          <List.Item>
            <List.Item.Meta
              avatar={<img src={`https://pocketbase-production-451f.up.railway.app/api/files/_pb_users_auth_/${user.id}/${user.avatar}?token=${pb.authStore.token}`} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />}
              title={user.name}
              description={user.email}
            />
            <Checkbox
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleUserSelect(user.id)}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ShareFileModal;
