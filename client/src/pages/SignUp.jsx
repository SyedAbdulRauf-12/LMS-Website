import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import axios from 'axios'; // Import axios to make API calls

function SignUp() {
  const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  password: '',
  dob: '',
  phone: '',
  semester: '-/-',
  teacherId: '',
  section: '-/-',       // <-- Ensure this is here
  university_id: '' // <-- Ensure this is here
});
  
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // --- UPDATED handleSubmit FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Combine role and formData for the API request
    const submissionData = {
      role: role,
      ...formData,
    };

    try {
      // Send the data to our back-end registration endpoint
      const response = await axios.post('/api/auth/register', submissionData);
      
      console.log('Registration successful:', response.data);
      alert('Registration successful! Please log in.');
      
      // Redirect the user to the login page after successful registration
      navigate('/login');

    } catch (err) {
      // If the back-end sends an error (e.g., user already exists), display it
      setError(err.response ? err.response.data.error : 'Registration failed. Please try again.');
      console.error('Registration error:', err.response ? err.response.data : err.message);
    }
  };
  // --- END OF UPDATED FUNCTION ---

  return (
    <main>
      <div className="form-container">
        <h2>Create Your Account</h2>

        <div className="form-group role-selector">
          <label>I am a:</label>
          <div>
            <input type="radio" id="role-student" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} />
            <label htmlFor="role-student">Student</label>
          </div>
          <div>
            <input type="radio" id="role-teacher" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} />
            <label htmlFor="role-teacher">Teacher</label>
          </div>
        </div>

        <form id="registration-form" onSubmit={handleSubmit}>
          {/* Conditional Rendering for student form */}
          {role === 'student' && (
            <div id="student-fields">
              <div className="form-group"><label htmlFor="fullName">Full Name</label><input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="university_id">University ID / USN</label><input type="text" id="university_id" name="university_id" value={formData.university_id} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="dob">Date of Birth</label><input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="email">College Email ID</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="semester">Semester</label><select id="semester" name="semester" value={formData.semester} onChange={handleChange}><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option><option value="5">5th</option><option value="6">6th</option><option value="7">7th</option><option value="8">8th</option></select></div>
              <div className="form-group">
                  <label htmlFor="section">Section</label>
                  <select id="section" name="section" value={formData.section} onChange={handleChange} required>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
            </div>
          )}

          {/* Conditional Rendering for teacher form */}
          {role === 'teacher' && (
            <div id="teacher-fields">
              <div className="form-group"><label htmlFor="fullName">Full Name</label><input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="teacherId">Teacher ID</label><input type="text" id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="dob">Date of Birth</label><input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="email">Official Email ID</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
            </div>
          )}
          
          <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required /></div>

          {/* Display error message if registration fails */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>Sign Up</button>
        </form>
      </div>
    </main>
  );
}

export default SignUp;