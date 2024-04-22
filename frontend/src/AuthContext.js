import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  setLoggedIn: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
