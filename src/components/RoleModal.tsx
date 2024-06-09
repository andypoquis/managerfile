// src/components/RoleModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import pb from '../pocketbase';

interface RoleRecord {
  id: string;
  collectionId: string;
  created: string;
  updated: string;
  name: string;
  description: string;
}

interface RoleModalProps {
  visible: boolean;
  onClose: () => void;
  role: RoleRecord | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ visible, onClose, role }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (role) {
      form.setFieldsValue(role);
    } else {
      form.resetFields();
    }
  }, [role, form]);

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (role) {
        await pb.collection('roles').update(role.id, values);
        message.success('Rol actualizado exitosamente');
      } else {
        await pb.collection('roles').create(values);
        message.success('Rol creado exitosamente');
      }
      onClose();
    } catch (error) {
      message.error('Error al guardar el rol: ' + (error as Error).message);
    }
  };

  return (
    <Modal
      visible={visible}
      title={role ? 'Editar Rol' : 'Crear Rol'}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Nombre del Rol"
          rules={[{ required: true, message: 'Por favor ingrese el nombre del rol' }]}
        >
          <Input placeholder="Ingrese el nombre del rol" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Por favor ingrese la descripción del rol' }]}
        >
          <Input.TextArea placeholder="Ingrese la descripción del rol" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold">
            {role ? 'Actualizar' : 'Crear'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
