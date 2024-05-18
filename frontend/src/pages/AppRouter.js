import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import WelcomePage from './WelcomePage';
import AboutUs from './AboutUs';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/"  element={<App />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path='/home' element={<App/>} />
      <Route path='#aboutus' element={<AboutUs/>}/>
    </Routes>
  );
}

export default AppRouter;
