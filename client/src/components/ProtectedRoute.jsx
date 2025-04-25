import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; 

const ProtectedRoute = ({ element }) => {
  const location = useLocation();
  const { authState, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      await checkAuth(); // This updates the context
      if (isMounted) setIsLoading(false);
    };

    verify();

    return () => { isMounted = false; };
  }, [checkAuth]);

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return authState.isAuthenticated
    ? element
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
