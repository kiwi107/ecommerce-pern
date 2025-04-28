import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    lastChecked: null
  });

  const checkAuth = async () => {
    if (authState.lastChecked && Date.now() - authState.lastChecked < 300000) {
      console.log(authState.user)
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache' // Prevent HTTP caching
        }
      });

      if (response.ok) {
        console.log('Auth check successful');
       
        const data = await response.json();
        console.log(data)
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          lastChecked: Date.now()
        });
        console.log("here is authStateuser",authState.user)
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          lastChecked: Date.now()
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't update lastChecked so we'll retry next time
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // Runs once when the component mounts

  return (
    <AuthContext.Provider value={{ authState, checkAuth, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
