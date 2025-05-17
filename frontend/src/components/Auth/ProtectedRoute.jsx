import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ requiredPermission }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific permission is required, allow access
  if (!requiredPermission) {
    return <Outlet />;
  }

  // Check if user has the required permission
  const [feature, action] = requiredPermission.split(':');
  
  // Admin has access to everything
  if (user.role?.name === 'admin') {
    return <Outlet />;
  }
  
  // Check user permissions
  const hasPermission = user.role?.permissions?.some(
    p => p.feat === feature && p.acts.includes(action)
  );
  
  if (hasPermission) {
    return <Outlet />;
  }
  
  // Redirect to unauthorized page if user doesn't have permission
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
