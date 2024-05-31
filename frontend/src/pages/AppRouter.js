import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import WelcomePage from './WelcomePage';
import AboutUs from './AboutUs';
import ProtectRoute from './ProtectRoute';
import { AuthProvider } from './AuthContext';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/welcome" 
          element={
            <ProtectRoute>
              <WelcomePage />
            </ProtectRoute>
          } 
        />
        <Route path="/home" element={<App />} />
        <Route path="#aboutus" element={<AboutUs />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppRouter;
