// src/pages/files/FolderView.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message, Button, List, Dropdown, Menu, Card, Row, Col } from 'antd';
import { FolderOpenOutlined, DeleteOutlined, ShareAltOutlined, MoreOutlined, UploadOutlined, FileOutlined } from '@ant-design/icons';
import ShareFileModal from './ShareFileModal';
import UploadFileModal from './UploadFileModal';
import pb from '../pocketbase';


interface FolderRecord {
  id: string;
  name: string;
  created: string;
  updated: string;
  file: string[];
  // otros campos relevantes...
}

interface FileRecord {
  id: string;
  collectionId: string;
  field: string;
  created: string;
  updated: string;
  name: string;
  shared: string[];
  owner: string;
}

const FolderView: React.FC = () => {
  const { folderName } = useParams<{ folderName: string }>();
  const [folder, setFolder] = useState<FolderRecord | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploadFileModalVisible, setUploadFileModalVisible] = useState(false);
  const [shareFileModalVisible, setShareFileModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const folderResult = await pb.collection('folders').getFirstListItem(`name="${folderName}"`);
        const transformedFolder: FolderRecord = {
          id: folderResult.id,
          name: folderResult.name,
          created: folderResult.created,
          updated: folderResult.updated,
          file: folderResult.file,
          // otros campos relevantes...
        };
        setFolder(transformedFolder);
      } catch (error) {
        message.error('Error al cargar la carpeta: ' + (error as Error).message);
      }
    };

    fetchFolder();
  }, [folderName]);

  useEffect(() => {
    if (folder) {
      const fetchFiles = async () => {
        try {
          const fileRecords = await Promise.all(
            folder.file.map(async (fileId) => {
              const file = await pb.collection('files').getOne(fileId);
              const transformedFile: FileRecord = {
                id: file.id,
                collectionId: file.collectionId,
                field: file.field,
                created: file.created,
                updated: file.updated,
                name: file.name,
                shared: file.shared,
                owner: file.owner,
              };
              return transformedFile;
            })
          );
          setFiles(fileRecords);
        } catch (error) {
          message.error('Error al cargar los archivos: ' + (error as Error).message);
        }
      };

      fetchFiles();

      const handleRealtimeChanges = (e: { action: string; record: FileRecord }) => {
        if (e.action === 'create') {
          setFiles((prevFiles) => [e.record, ...prevFiles]);
        } else if (e.action === 'update') {
          setFiles((prevFiles) =>
            prevFiles.map((file) => (file.id === e.record.id ? e.record : file))
          );
        } else if (e.action === 'delete') {
          setFiles((prevFiles) => prevFiles.filter((file) => file.id !== e.record.id));
        }
      };

      pb.collection('files').subscribe('*', handleRealtimeChanges);

      return () => {
        pb.collection('files').unsubscribe('*');
      };
    }
  }, [folder]);

  const handleFileUpload = async (fileId: string) => {
    if (folder) {
      try {
        const updatedFiles = [...folder.file, fileId];
        await pb.collection('folders').update(folder.id, { file: updatedFiles });
        setFolder({ ...folder, file: updatedFiles });
        message.success('Archivo agregado a la carpeta exitosamente');
      } catch (error) {
        message.error('Error al agregar el archivo a la carpeta: ' + (error as Error).message);
      }
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await pb.collection('files').delete(fileId);
      message.success('Archivo eliminado exitosamente');
    } catch (error) {
      message.error('Error al eliminar el archivo: ' + (error as Error).message);
    }
  };

  const handleShareFile = (file: FileRecord) => {
    setSelectedFile(file);
    setShareFileModalVisible(true);
  };

  const getFileUrl = (file: FileRecord) => {
    const token = pb.authStore.token;
    return `https://pocketbase-production-451f.up.railway.app/api/files/${file.collectionId}/${file.id}/${file.field}?token=${token}`;
  };

  if (!folder) {
    return <div>Cargando...</div>;
  }

  const fileMenu = (file: FileRecord) => (
    <Menu>
      <Menu.Item key="0">
        <a href={getFileUrl(file)} target="_blank" rel="noopener noreferrer">
          Abrir
        </a>
      </Menu.Item>
      <Menu.Item key="1" onClick={() => handleFileDelete(file.id)}>
        Eliminar
      </Menu.Item>
      <Menu.Item key="2" onClick={() => handleShareFile(file)}>
        Compartir
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">{folder.name}</h1>
          <p className="text-gray-600">ID: {folder.id}</p>
        </div>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
          onClick={() => setUploadFileModalVisible(true)}
        >
          Subir Archivo
        </Button>
      </div>
      <UploadFileModal
        visible={uploadFileModalVisible}
        onClose={() => setUploadFileModalVisible(false)}
        onUploadSuccess={handleFileUpload}
      />
      {selectedFile && (
        <ShareFileModal
          visible={shareFileModalVisible}
          onClose={() => setShareFileModalVisible(false)}
          fileId={selectedFile.id}
          currentShared={selectedFile.shared}
        />
      )}
      <Row gutter={[16, 16]}>
        {files.map((file) => (
          <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Card.Meta
                avatar={<FileOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                title={<a href={getFileUrl(file)} target="_blank" rel="noopener noreferrer">{file.name}</a>}
                description={`Actualizado: ${new Date(file.updated).toLocaleString()}`}
              />
              <Dropdown overlay={() => fileMenu(file)} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} className="absolute top-2 right-2" />
              </Dropdown>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FolderView;
