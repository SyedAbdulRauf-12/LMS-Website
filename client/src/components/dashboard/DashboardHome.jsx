import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('/api/dashboard/teacher-summary', config);
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (!summary) {
    return <p>Could not load dashboard data. Please try again later.</p>;
  }

  return (
    <div className="dashboard-home">
      {/* 1. Welcome & Quick Actions */}
      <div className="welcome-banner">
        <h2>Welcome back!</h2>
        <p>Here are your quick actions to get started:</p>
        <div className="quick-actions">
          <Link to="create-assignment" className="btn btn-primary">Create Assignment</Link>
          <Link to="upload-notes" className="btn btn-secondary">Upload Note</Link>
          <Link to="create-class" className="btn btn-secondary">Manage Classes</Link>
        </div>
      </div>

      {/* 2. "At a Glance" Statistics */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>{summary.stats.class_count}</h3>
          <p>Total Classes</p>
        </div>
        <div className="stat-card">
          <h3>{summary.stats.student_count}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{summary.stats.upcoming_deadlines}</h3>
          <p>Assignments Due This Week</p>
        </div>
      </div>

      {/* 3. "My Classes" Overview */}
      <div className="list-card" style={{ marginTop: '2rem' }}>
        <h2>My Classes Overview</h2>
        {summary.classes.length > 0 ? (
          summary.classes.map(cls => (
            <div key={cls.class_id} className="class-overview-card">
              <div>
                <h4>{cls.class_name}</h4>
                <p>{cls.course_code} - Section {cls.section}</p>
              </div>
              <Link to={`class/${cls.class_id}`} className="btn btn-primary">Manage</Link>
            </div>
          ))
        ) : (
          <p>You haven't created any classes yet. Go to "Manage Classes" to get started.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;