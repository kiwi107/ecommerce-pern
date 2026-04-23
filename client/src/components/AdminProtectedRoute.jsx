import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const AdminProtectedRoute = ({ children }) => {
  const { authState } = useAuth();

  if (authState.loading) return <div>Loading...</div>;

  console.log('Auth State:', authState);

  // If not authenticated or not admin
  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return <Navigate to="/adminLogin" replace />;
  }
  return children;
};

export default AdminProtectedRoute;
