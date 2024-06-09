import React from 'react';

const DashboardContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bienvenido al Gestor de Archivos</h2>
        <p className="text-gray-600">
          Aquí puedes gestionar todos tus archivos de manera eficiente y segura. Usa el menú de la izquierda para navegar entre las diferentes secciones.
        </p>
      </div>
    </div>
  );
};

export default DashboardContent;
