import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Send the login request to our back-end
      const response = await axios.post('/api/auth/login', formData);
      
      // The back-end will send back a token and the user's role
      const { token, role } = response.data;
      
      // Store the token in the browser's local storage
      // This is how we'll keep the user logged in
      localStorage.setItem('token', token);
      
      // Redirect the user to the correct dashboard based on their role
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        setError('Unknown role.'); // Should not happen
      }

    } catch (err) {
      // If the back-end sends a 401 or other error, display it
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <main>
      <div className="form-container">
        <h2>Log In to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          
          {/* Display error message if login fails */}
          {error && <p style={{ color: 'red' }}>{error}</p>}


          <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>Log In</button>
          <div className="login-prompt" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span>Don't have an account? </span>
          <Link to="/SignUp" className="login-link" style={{ color: '#007bff' }}>
            Sign up here
          </Link>
        </div>

        </form>
      </div>
    </main>
  );
}

export default Login;