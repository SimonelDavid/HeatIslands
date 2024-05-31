import React, { createContext, useState } from 'react';

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

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
