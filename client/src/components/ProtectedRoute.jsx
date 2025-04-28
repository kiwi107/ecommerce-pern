import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  console.log('Auth State:', authState); // Debugging line
  if (authState.loading) {
    // Optionally, show a loading state if checking is in progress
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
   
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the protected route
  return children;
};

export default ProtectedRoute;
