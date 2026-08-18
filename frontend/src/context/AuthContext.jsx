import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (user && user.token) {
        try {
          const freshData = await authService.getMe();
          setUser((prev) => {
            const updated = { ...prev, ...freshData };
            localStorage.setItem('userInfo', JSON.stringify(updated));
            return updated;
          });
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const loginUser = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const registerUser = async (registrationData) => {
    const data = await authService.register(registrationData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const registerProviderUser = async (providerData) => {
    const data = await authService.registerProvider(providerData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const becomeProviderUser = async (providerData) => {
    const data = await authService.becomeProvider(providerData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        registerProvider: registerProviderUser,
        becomeProvider: becomeProviderUser,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
