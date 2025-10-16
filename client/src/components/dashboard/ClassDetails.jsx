import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ClassDetails() {
  const { classId } = useParams();

  // State for the component
  const [classDetails, setClassDetails] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // <-- New state for the dropdown
  const [selectedStudent, setSelectedStudent] = useState(''); // <-- New state for the selected student to add
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        // Fetch class details, enrolled students, AND all students concurrently
        const [classRes, enrolledRes, allStudentsRes] = await Promise.all([
          axios.get(`/api/classes/${classId}`, config),
          axios.get(`/api/classes/${classId}/students`, config),
          axios.get('/api/users/students', config) // <-- New API call
        ]);
        
        setClassDetails(classRes.data);
        setEnrolledStudents(enrolledRes.data);
        setAllStudents(allStudentsRes.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch data. You may not have access to this resource.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [classId]);

  // --- EVENT HANDLERS ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { student_id: selectedStudent };

      const res = await axios.post(`/api/classes/${classId}/students`, body, config);
      
      // Add the newly enrolled student to our state to update the UI instantly
      setEnrolledStudents([...enrolledStudents, res.data]);
      setSelectedStudent(''); // Reset dropdown
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add student.');
    }
  };

  const handleRemoveStudent = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the class?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      await axios.delete(`/api/enrollments/${enrollmentId}`, config);
      
      // Update the UI by filtering out the removed student
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

      // Update the status in our local state to reflect the change instantly
      setEnrolledStudents(enrolledStudents.map(s => 
        s.enrollment_id === enrollmentId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  // --- RENDER LOGIC ---
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  // Filter out students who are already enrolled from the "Add Student" dropdown
  const availableStudents = allStudents.filter(
    (student) => !enrolledStudents.some((enrolled) => enrolled.user_id === student.user_id)
  );

  return (
    <section className="content-section">
      <Link to="/teacher/dashboard/create-class">&larr; Back to All Classes</Link>
      <h1>{classDetails.class_name}</h1>
      <p><strong>Course Code:</strong> {classDetails.course_code} | <strong>Semester:</strong> {classDetails.semester}</p>
      
      {/* --- ADD STUDENT FORM --- */}
      <div className="form-card">
        <h2>Add Student to Class</h2>
        <form onSubmit={handleAddStudent}>
          <div className="form-group">
            <label htmlFor="student-select">Select a Student</label>
            <select id="student-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
              <option value="" disabled>-- Choose a student --</option>
              {availableStudents.map(student => (
                <option key={student.user_id} value={student.user_id}>{student.full_name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add Student</button>
        </form>
      </div>

      <div className="list-card">
        <h2>Enrolled Students</h2>
        <table className="class-table">
          <thead>
            <tr>
              <th>Student Name</th>
               <th>ID/USN</th>
              <th>Eligibility Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map(student => (
                <tr key={student.enrollment_id}>
                  <td>{student.full_name}</td>
                   <td>{student.user_id}</td>
                  <td>
                    <select value={student.status} onChange={(e) => handleStatusChange(student.enrollment_id, e.target.value)}>
                      <option value="eligible">Eligible</option>
                      <option value="pending">Pending</option>
                      <option value="ineligible">Ineligible</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleRemoveStudent(student.enrollment_id)} className="btn-action btn-delete">Remove</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No students are enrolled in this class yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ClassDetails;