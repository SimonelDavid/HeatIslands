import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [loginMessage, setLoginMessage] = useState('');
  const { setLoggedIn } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setLoginMessage('Please fill in both email and password fields.');
      return;
    }

    try {
      const response = await fetch('https://heat.island.aim-space.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem('token', token);
        setLoggedIn(true);
        window.location.href = '/welcome'; // Redirect on successful login
      } else {
        setLoginMessage('Incorrect login credentials');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginMessage('An error occurred during authentication');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
        </label>
        <button type="submit">Login</button>
        <p>{loginMessage}</p>
      </form>
    </div>
  );
}

export default Login;
