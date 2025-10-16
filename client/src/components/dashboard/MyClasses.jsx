import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MyClasses() {
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('/api/student/classes', config);
        setMyClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch student's classes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyClasses();
  }, []);

  if (loading) {
    return <p>Loading your classes...</p>;
  }

  return (
    <section className="content-section">
      <h1>My Classes</h1>
      <p>Here are all the classes you are currently enrolled in.</p>
      
      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        {myClasses.length > 0 ? (
          myClasses.map(cls => (
            <div key={cls.class_id} className="stat-card" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{cls.class_name}</h3>
              <p><strong>Course Code:</strong> {cls.course_code}</p>
              <p><strong>Section:</strong> {cls.section}</p>
              <p><strong>Teacher:</strong> {cls.teacher_name}</p>
              <div style={{ marginTop: '1.5rem' }}>
                 {/* This link won't work yet, but we'll build it next */}
                <Link to={`/student/dashboard/class/${cls.class_id}`} className="btn btn-primary">
                  View Class
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="form-card">
            <p>You are not enrolled in any classes yet. Please contact your teacher or an administrator.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyClasses;