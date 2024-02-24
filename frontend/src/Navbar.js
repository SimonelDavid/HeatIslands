// Navbar.js
import React from 'react';
import './navbar.css';

function Navbar({ setShowLogin, goToHome, toggleAboutUsModal }){
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
            <a href="#home" onClick={goToHome}>Home</a>
        </li>
        <li className="navbar-item">
        <a href="#login" onClick={() => setShowLogin(true)}>Login</a>
        </li>
        <li className="navbar-item">
          <a href="#footer">Contact</a>
        </li>
        <li className='navbar-item'>
          <a href='#aboutus' onClick={toggleAboutUsModal}>About Us</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
