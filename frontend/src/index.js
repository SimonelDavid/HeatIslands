import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import reportWebVitals from './pages/reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './pages/AppRouter';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AppRouter />
    </Router>
  </React.StrictMode>
);