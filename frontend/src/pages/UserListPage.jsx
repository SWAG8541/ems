import React from 'react';
import { Navigate } from 'react-router-dom';

const UserListPage = () => {
  return <Navigate to="/admin/users" replace />;
};

export default UserListPage;
