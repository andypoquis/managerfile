import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import { List, message, Card, Col, Row, Dropdown, Button, Menu } from 'antd';
import { FolderOutlined, FileOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons';
import UploadFileModal from '../../components/UploadFileModal';
import UploadFolderModal from '../../components/UploadFolderModal';
import ShareFileModal from '../../components/ShareFileModal';

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

interface FolderRecord {
  id: string;
  collectionId: string;
  created: string;
  updated: string;
  name: string;
  update_folder: string;
  create_folder: string;
  file: string[];
  shared: string[];
  owner: string;
}

const Files: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([]);
  const [uploadFileModalVisible, setUploadFileModalVisible] = useState(false);
  const [uploadFolderModalVisible, setUploadFolderModalVisible] = useState(false);
  const [shareFileModalVisible, setShareFileModalVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuType, setContextMenuType] = useState<'file' | 'folder' | 'empty'>('empty');
  const [selectedRecord, setSelectedRecord] = useState<FileRecord | FolderRecord | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFilesAndFolders = async () => {
      try {
        const fileResult = await pb.collection('files').getFullList();
        const folderResult = await pb.collection('folders').getFullList();

        const mappedFiles = fileResult.map((record: any) => ({
          id: record.id,
          collectionId: record.collectionId,
          field: record.field,
          created: record.created,
          updated: record.updated,
          name: record.name,
          shared: record.shared,
          owner: record.owner,
        }));

        const mappedFolders = folderResult.map((record: any) => ({
          id: record.id,
          collectionId: record.collectionId,
          created: record.created,
          updated: record.updated,
          name: record.name,
          update_folder: record.update_folder,
          create_folder: record.create_folder,
          file: record.file,
          shared: record.shared,
          owner: record.owner,
        }));

        setFiles(mappedFiles);
        setFolders(mappedFolders);
        setRecentFiles(mappedFiles.slice(0, 4));
      } catch (error) {
        message.error('Error al cargar los archivos y carpetas: ' + (error as Error).message);
      }
    };

    fetchFilesAndFolders();

    const handleRealtimeFileChanges = (e: { action: string; record: FileRecord }) => {
      message.info(`Archivo ${e.action}: ${e.record.name}`);
      if (e.action === 'create') {
        setFiles(prevFiles => [e.record, ...prevFiles]);
        setRecentFiles(prevFiles => [e.record, ...prevFiles.slice(0, 3)]);
      } else if (e.action === 'update') {
        setFiles(prevFiles => {
          const existingFileIndex = prevFiles.findIndex(file => file.id === e.record.id);
          if (existingFileIndex !== -1) {
            const updatedFiles = [...prevFiles];
            updatedFiles[existingFileIndex] = e.record;
            return updatedFiles;
          } else {
            return [e.record, ...prevFiles];
          }
        });

        setRecentFiles(prevFiles => {
          const existingFileIndex = prevFiles.findIndex(file => file.id === e.record.id);
          if (existingFileIndex !== -1) {
            const updatedFiles = [...prevFiles];
            updatedFiles[existingFileIndex] = e.record;
            return updatedFiles.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()).slice(0, 4);
          } else {
            return [e.record, ...prevFiles].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()).slice(0, 4);
          }
        });
      } else if (e.action === 'delete') {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== e.record.id));
        setRecentFiles(prevFiles => prevFiles.filter(file => file.id !== e.record.id).slice(0, 4));
      }
    };

    const handleRealtimeFolderChanges = (e: { action: string; record: FolderRecord }) => {
      message.info(`Carpeta ${e.action}: ${e.record.name}`);
      if (e.action === 'create') {
        setFolders(prevFolders => [e.record, ...prevFolders]);
      } else if (e.action === 'update') {
        setFolders(prevFolders => prevFolders.map(folder => (folder.id === e.record.id ? e.record : folder)));
      } else if (e.action === 'delete') {
        setFolders(prevFolders => prevFolders.filter(folder => folder.id !== e.record.id));
      }
    };

    pb.collection('files').subscribe('*', handleRealtimeFileChanges);
    pb.collection('folders').subscribe('*', handleRealtimeFolderChanges);

    return () => {
      pb.collection('files').unsubscribe('*');
      pb.collection('folders').unsubscribe('*');
    };
  }, []);

  const getFileUrl = (file: FileRecord) => {
    const token = pb.authStore.token;
    return `https://pocketbase-production-451f.up.railway.app/api/files/${file.collectionId}/${file.id}/${file.field}?token=${token}`;
  };

  const handleShare = (file: FileRecord) => {
    setSelectedRecord(file);
    setShareFileModalVisible(true);
  };

  const handleFolderClick = (folderName: string) => {
    navigate(`/dashboard/files/${folderName}`);
  };

  const fileMenu = (
    <Menu>
      {selectedRecord && 'collectionId' in selectedRecord ? (
        <>
          <Menu.Item key="0">
            <a href={getFileUrl(selectedRecord as FileRecord)} target="_blank" rel="noopener noreferrer">Abrir</a>
          </Menu.Item>
          <Menu.Item key="1" onClick={() => handleShare(selectedRecord as FileRecord)}>
            Compartir
          </Menu.Item>
        </>
      ) : null}
      <Menu.Item key="2">
        <a href="#">Eliminar</a>
      </Menu.Item>
    </Menu>
  );

  const folderMenu = (
    <Menu>
      <Menu.Item key="0" onClick={() => handleFolderClick(selectedRecord?.name || '')}>
        <a href="#">Abrir</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="#">Compartir</a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="#">Eliminar</a>
      </Menu.Item>
    </Menu>
  );

  const emptyMenu = (
    <Menu>
      <Menu.Item key="0" onClick={() => setUploadFileModalVisible(true)}>Subir Archivo</Menu.Item>
      <Menu.Item key="1" onClick={() => setUploadFolderModalVisible(true)}>Crear Carpeta</Menu.Item>
    </Menu>
  );

  const handleContextMenu = (event: React.MouseEvent, record?: FileRecord | FolderRecord, type?: 'file' | 'folder') => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuType(type || 'empty');
    setSelectedRecord(record || null);
    setContextMenuVisible(true);
  };

  return (
    <div
      onClick={() => setContextMenuVisible(false)}
      onContextMenu={(e) => handleContextMenu(e)}
      className="relative"
      ref={containerRef}
    >
      {contextMenuVisible && (
        <div
          style={{ position: 'absolute', top: contextMenuPosition.y, left: contextMenuPosition.x, zIndex: 1000 }}
        >
          <Dropdown
            overlay={contextMenuType === 'file' ? fileMenu : contextMenuType === 'folder' ? folderMenu : emptyMenu}
            visible={contextMenuVisible}
            getPopupContainer={() => containerRef.current || document.body}
          >
            <div style={{ width: 0, height: 0 }} />
          </Dropdown>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4 sm:mb-0">Administrador de archivos</h1>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
          onClick={() => setUploadFileModalVisible(true)}
        >
          Agregar nuevo archivo
        </Button>
      </div>
      <UploadFileModal visible={uploadFileModalVisible} onClose={() => setUploadFileModalVisible(false)} onUploadSuccess={function (fileId: string): void {
        throw new Error('Function not implemented.');
      } } />
      <UploadFolderModal visible={uploadFolderModalVisible} onClose={() => setUploadFolderModalVisible(false)} />
      <ShareFileModal
        visible={shareFileModalVisible}
        onClose={() => setShareFileModalVisible(false)}
        fileId={selectedRecord && 'collectionId' in selectedRecord ? (selectedRecord as FileRecord).id : ''}
        currentShared={selectedRecord && 'collectionId' in selectedRecord ? (selectedRecord as FileRecord).shared : []}
      />
      <div className="bg-gray-100 p-4 rounded-lg">
        <Row gutter={[16, 16]}>
          {folders.map(folder => (
            <Col key={folder.id} xs={24} sm={12} md={8} lg={6} onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}>
              <Card hoverable onClick={() => handleFolderClick(folder.name)}>
                <Card.Meta
                  avatar={<FolderOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                  title={folder.name}
                  description={`Actualizado: ${new Date(folder.updated).toLocaleString()}`}
                />
                <Dropdown overlay={folderMenu} trigger={['click']}>
                  <Button type="text" icon={<MoreOutlined />} className="absolute top-2 right-2" />
                </Dropdown>
              </Card>
            </Col>
          ))}
          {files.map(file => (
            <Col key={file.id} xs={24} sm={12} md={8} lg={6} onContextMenu={(e) => handleContextMenu(e, file, 'file')}>
              <Card hoverable>
                <Card.Meta
                  avatar={<FileOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                  title={<a href={getFileUrl(file)} target="_blank" rel="noopener noreferrer">{file.field}</a>}
                  description={`Actualizado: ${new Date(file.updated).toLocaleString()}`}
                />
                <Dropdown overlay={fileMenu} trigger={['click']} onVisibleChange={() => setSelectedRecord(file)}>
                  <Button type="text" icon={<MoreOutlined />} className="absolute top-2 right-2" />
                </Dropdown>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Archivos recientes</h2>
        <List
          itemLayout="horizontal"
          dataSource={recentFiles}
          renderItem={file => (
            <List.Item onContextMenu={(e) => handleContextMenu(e, file, 'file')}>
              <List.Item.Meta
                title={<a href={getFileUrl(file)} target="_blank" rel="noopener noreferrer">{file.field}</a>}
                description={`Creado: ${new Date(file.created).toLocaleString()} | Actualizado: ${new Date(file.updated).toLocaleString()}`}
              />
              <Dropdown overlay={() => fileMenu} trigger={['click']} onVisibleChange={() => setSelectedRecord(file)}>
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Files;
