import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Ensure this is imported correctly

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

  const redirectToWelcomePage = () => {
    window.location.href = '/welcome';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setLoginMessage('Please fill in both email and password fields.');
      return;
    }

    try {
      const response = await fetch('http://backend:8080/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        setLoginMessage('Authentication successful');
        setLoggedIn(true); // Update login status only on successful authentication
        redirectToWelcomePage(); // Redirect only on successful authentication
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
