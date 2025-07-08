import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface User {
  id: string;
  discordId: string | null;
  username: string;
  isTemporary?: boolean;
  tempSessionId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: () => void;
  loginTemporary: () => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  loginTemporary: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Important for cookies
        });

        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = () => {
    window.location.href = '/api/auth/discord';
  };

  // Temporary login function
  const loginTemporary = async () => {
    try {
      setLoading(true);
      
      // Check for existing session ID in localStorage
      const existingSessionId = localStorage.getItem('tempSessionId');
      
      const response = await fetch('/api/auth/temp-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          existingSessionId: existingSessionId
        }),
      });

      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Store the session ID for future use
        if (data.user.tempSessionId) {
          localStorage.setItem('tempSessionId', data.user.tempSessionId);
        }
      } else {
        throw new Error('Failed to create temporary session');
      }
    } catch (error) {
      console.error('Temporary login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        credentials: 'include',
      });

      setIsAuthenticated(false);
      setUser(null);
      
      // Clear temporary session ID from localStorage
      localStorage.removeItem('tempSessionId');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, loginTemporary, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
