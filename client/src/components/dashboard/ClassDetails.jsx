import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ClassDetails() {
  const { classId } = useParams();

  const [classDetails, setClassDetails] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [bulkAddSemester, setBulkAddSemester] = useState('1');
  const [bulkAddSection, setBulkAddSection] = useState('A');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const [classRes, enrolledRes, allStudentsRes] = await Promise.all([
        axios.get(`/api/classes/${classId}`, config),
        axios.get(`/api/classes/${classId}/students`, config),
        axios.get('/api/users/students', config)
      ]);
      setClassDetails(classRes.data);
      setEnrolledStudents(enrolledRes.data);
      setAllStudents(allStudentsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { student_id: selectedStudent };
      const res = await axios.post(`/api/classes/${classId}/students`, body, config);
      setEnrolledStudents([...enrolledStudents, res.data]);
      setSelectedStudent('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add student.');
    }
  };

  const handleRemoveStudent = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`/api/enrollments/${enrollmentId}`, config);
      setEnrolledStudents(enrolledStudents.filter(s => s.enrollment_id !== enrollmentId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove student.');
    }
  };
  
  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { status: newStatus };
      await axios.put(`/api/enrollments/${enrollmentId}`, body, config);
      setEnrolledStudents(enrolledStudents.map(s => 
        s.enrollment_id === enrollmentId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };
  
  const handleBulkAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { sourceSemester: bulkAddSemester, sourceSection: bulkAddSection };
      const res = await axios.post(`/api/classes/${classId}/bulk-enroll`, body, config);
      alert(res.data.msg || 'Bulk enrollment request sent.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add students.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  const availableStudents = allStudents.filter(s => !enrolledStudents.some(enrolled => enrolled.user_id === s.user_id));

  return (
    <section className="content-section">
      <Link to="/teacher/dashboard/create-class">&larr; Back to All Classes</Link>
      <h1>{classDetails.class_name}</h1>
      <p><strong>Course Code:</strong> {classDetails.course_code}</p>

      <div className="form-card">
        <h2>Bulk Add Students</h2>
        <form onSubmit={handleBulkAdd}>
          <div className="form-group">
            <label htmlFor="bulk-semester">From Semester</label>
            <select id="bulk-semester" value={bulkAddSemester} onChange={(e) => setBulkAddSemester(e.target.value)}>
              {[...Array(8).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="bulk-section">From Section</label>
            <select id="bulk-section" value={bulkAddSection} onChange={(e) => setBulkAddSection(e.target.value)}>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add Students from Section</button>
        </form>
      </div>

      <div className="form-card">
        <h2>Add a Single Student (Manual Entry)</h2>
        <form onSubmit={handleAddStudent}>
          <div className="form-group">
            <label htmlFor="student-select">Select a Student</label>
            <select id="student-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
              <option value="" disabled>-- Choose a student --</option>
              {availableStudents.map(student => (
                <option key={student.user_id} value={student.user_id}>{student.full_name} ({student.user_id})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">Add Student</button>
        </form>
      </div>
      
      <div className="list-card">
        <h2>Enrolled Students</h2>
        <table className="class-table">
          <thead><tr><th>Student Name</th><th>ID/USN</th><th>Eligibility Status</th><th>Actions</th></tr></thead>
          <tbody>
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map(student => (
                <tr key={student.enrollment_id}>
                  <td>{student.full_name}</td>
                  <td>{student.university_id || 'N/A'}</td>
                  <td>
                    <select value={student.status} onChange={(e) => handleStatusChange(student.enrollment_id, e.target.value)}>
                      <option value="pending">Pending</option><option value="eligible">Eligible</option><option value="ineligible">Ineligible</option>
                    </select>
                  </td>
                  <td><button onClick={() => handleRemoveStudent(student.enrollment_id)} className="btn-action btn-delete">Remove</button></td>
                </tr>
              ))
            ) : (<tr><td colSpan="4">No students are enrolled in this class yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ClassDetails;