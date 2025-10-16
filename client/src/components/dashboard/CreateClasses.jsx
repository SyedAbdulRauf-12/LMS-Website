import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function CreateClasses() {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1',
    section: 'A',
    description: '',
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = {
          headers: { 'x-auth-token': token },
        };
        
        const res = await axios.get('/api/classes', config);
        setClasses(res.data);
      } catch (err) {
        console.error('Error fetching classes:', err.response ? err.response.data : err.message);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const res = await axios.post('/api/classes', formData, config);
      
      setClasses([res.data, ...classes]); // Add new class to the top of the list
      setFormData({ name: '', code: '', semester: 'Fall 2025', section: 'A', description: '' }); // Clear form
    } catch (err) {
      console.error('Error creating class:', err.response.data);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      await axios.delete(`/api/classes/${classId}`, config);
      
      setClasses(classes.filter(cls => cls.class_id !== classId));
    } catch (err) {
      console.error('Error deleting class:', err.response.data);
    }
  };

  return (
    <section className="content-section">
      <h1>Manage Your Classes</h1>
      <div className="form-card">
        <h2>Create a New Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Class Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="code">Course Code</label>
            <input type="text" id="code" name="code" value={formData.code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="section">Section</label>
            <select id="section" name="section" value={formData.section} onChange={handleChange} required>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Create Class</button>
        </form>
      </div>
      <div className="list-card">
        <h2>Existing Classes</h2>
        <table className="class-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Class Name</th>
              <th>Semester</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((cls) => (
                <tr key={cls.class_id}>
                  <td>{cls.course_code}</td>
                  <td>{cls.class_name}</td>
                  <td>{cls.semester}</td>
                  <td>{cls.section}</td>
                 <td>
                  <Link to={`/teacher/dashboard/class/${cls.class_id}`} className="btn-action">
                    View
                  </Link>
                  <button onClick={() => handleDelete(cls.class_id)} className="btn-action btn-delete">
                    Delete
                  </button>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No classes found. Create one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CreateClasses;