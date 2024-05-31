import React, { useContext } from 'react';
import '../styles/navbar.css';
import logo from '../assets/icon.png';
import { AuthContext } from './AuthContext';

function Navbar({ setShowLogin, goToHome, toggleAboutUsModal, toggleContactUsModal }) {
  const { isLoggedIn, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <div className="navbar-logo-container">
          <img src={logo} alt="logo" className="navbar-logo" />
        </div>
        <div className="navbar-items">
          <li className="navbar-item">
            <a href="#home" onClick={goToHome}>Home</a>
          </li>
          {isLoggedIn ? (
            <li className="navbar-item">
              <a href="#logout" onClick={logout}>Logout</a>
            </li>
          ) : (
            <li className="navbar-item">
              <a href="#login" onClick={() => setShowLogin(true)}>Login</a>
            </li>
          )}
          <li className="navbar-item">
            <a href="#contactus" onClick={toggleContactUsModal}>Contact</a>
          </li>
          <li className='navbar-item'>
            <a href='#aboutus' onClick={toggleAboutUsModal}>About</a>
          </li>
        </div>
      </ul>
    </nav>
  );
}

export default Navbar;
