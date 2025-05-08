import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  token: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const checkTokenExpiration = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token has expired
        setToken(null);
        setIsAuthenticated(false);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          if (checkTokenExpiration(storedToken)) {
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token is expired, remove it from storage
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    // Update AsyncStorage when token changes
    const saveToken = async () => {
      try {
        if (token) {
          if (checkTokenExpiration(token)) {
            await AsyncStorage.setItem('token', token);
          } else {
            await AsyncStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
          await AsyncStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error saving token:', error);
      }
    };
    saveToken();
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 