// src/components/UploadFileModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import pb from '../pocketbase';

const UploadFileModal: React.FC<{ visible: boolean, onClose: () => void, onUploadSuccess: (fileId: string) => void }> = ({ visible, onClose, onUploadSuccess }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpload = async (values: { name: string }) => {
    setLoading(true);

    // Obtener el ID del usuario logueado desde el localStorage
    const userRecord = JSON.parse(localStorage.getItem('userRecord') || '{}');
    const userId = userRecord.id;

    const formData = new FormData();
    formData.append('field', fileList[0].originFileObj);
    formData.append('owner', userId);
    formData.append('shared', userId); // Enviar el ID del usuario logueado tanto en owner como en shared

    try {
      const record = await pb.collection('files').create(formData);
      message.success('Archivo subido exitosamente');
      form.resetFields();
      setFileList([]);
      onUploadSuccess(record.id); // Llamar a la función de éxito con el ID del archivo creado
      onClose();
    } catch (error) {
      message.error('Error al subir el archivo: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Subir nuevo archivo"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleUpload}>
        <Form.Item
          name="file"
          label="Archivo"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          rules={[{ required: true, message: 'Por favor seleccione un archivo' }]}
        >
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
            Subir archivo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFileModal;
