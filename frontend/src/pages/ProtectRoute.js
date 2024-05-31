import React, { useContext } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectRoute = ({ element, ...rest }) => {
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? (
    <Route {...rest} element={element} />
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectRoute;
