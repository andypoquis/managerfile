// src/components/UploadFolderModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import pb from '../pocketbase';

const UploadFolderModal: React.FC<{ visible: boolean, onClose: () => void }> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCreateFolder = async (values: { name: string }) => {
    setLoading(true);
    const data = {
      name: values.name,
      file: [],
      shared: [],
    };

    try {
      const record = await pb.collection('folders').create(data);
      message.success('Carpeta creada exitosamente');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Error al crear la carpeta: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Crear nueva carpeta"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleCreateFolder}>
        <Form.Item
          name="name"
          label="Nombre de la carpeta"
          rules={[{ required: true, message: 'Por favor ingrese el nombre de la carpeta' }]}
        >
          <Input placeholder="Ingrese el nombre de la carpeta" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
            Crear carpeta
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFolderModal;
