let authState = {
  isAuthenticated: false,
  user: null,
  lastChecked: null
};

export const checkAuth = async () => {
 
  if (authState.lastChecked && Date.now() - authState.lastChecked < 300000) {
    return authState;
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
      authState = {
        isAuthenticated: true,
        user: data.user,
        lastChecked: Date.now()
      };
      return authState;
    } else {
      authState = {
        isAuthenticated: false,
        user: null,
        lastChecked: Date.now()
      };
        return authState;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Don't update lastChecked so we'll retry next time
  }

 
};

export const getAuthState = () => authState;