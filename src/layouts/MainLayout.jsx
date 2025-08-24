// src/layouts/MainLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
