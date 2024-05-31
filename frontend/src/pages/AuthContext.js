import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext({
  isLoggedIn: false,
  setLoggedIn: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const logout = () => {
    setLoggedIn(false);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setLoggedIn(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
