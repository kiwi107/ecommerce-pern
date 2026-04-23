import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    lastChecked: null,
    loading: true
  });

  const checkAuth = async () => {
    // Check if we have already validated within the last 5 minutes (300,000 ms)
    if (authState.lastChecked && Date.now() - authState.lastChecked < 300000) {
      console.log('Using cached authentication state', authState.user);
      return;
    }

    try {
      // Generalized check using a "/auth/check" route
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/check`, {
        credentials: 'include', // Send cookies with the request
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data.user);
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          lastChecked: Date.now(),
          loading: false
        });
        console.log('Authentication check successful', data);
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          lastChecked: Date.now(),
          loading: false
        });
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        lastChecked: Date.now(),
        loading: false
      });
    }
  };

  // Run the check on initial load
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
