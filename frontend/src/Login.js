import React, { useState } from 'react';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [loginMessage, setLoginMessage] = useState('');

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
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        setLoginMessage('Authentication successful');
        redirectToWelcomePage();
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
          Parolă:
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>{loginMessage}</p>
    </div>
  );
}

export default Login;