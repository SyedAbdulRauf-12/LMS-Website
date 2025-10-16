// ***** COPY THIS ENTIRE BLOCK INTO YOUR FILE *****
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function CreateAssignments() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      try {
        const res = await axios.get('/api/classes', config);
        setClasses(res.data);
      } catch (err) { console.error('Failed to fetch classes', err); }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setAssignments([]); return; }
    const fetchAssignments = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      try {
        const res = await axios.get(`/api/classes/${selectedClass}/assignments`, config);
        setAssignments(res.data);
      } catch (err) { console.error('Failed to fetch assignments', err); }
    };
    fetchAssignments();
  }, [selectedClass]);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) { alert('Please select a class first.'); return; }
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      const res = await axios.post(`/api/classes/${selectedClass}/assignments`, formData, config);
      setAssignments([res.data, ...assignments]);
      setFormData({ title: '', description: '', dueDate: '' });
    } catch (err) { console.error('Failed to create assignment', err); }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`/api/assignments/${assignmentId}`, config);
      setAssignments(assignments.filter(a => a.assignment_id !== assignmentId));
    } catch (err) {
      console.error('Failed to delete assignment', err);
      alert('Failed to delete assignment.');
    }
  };

  const handleEditClick = (assignment) => {
      const localDate = new Date(assignment.due_date);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0'); // padStart adds a leading zero if needed
      const day = String(localDate.getDate()).padStart(2, '0');
      const formattedDateForInput = `${year}-${month}-${day}`;

      const formattedAssignment = {
        ...assignment,
        due_date: formattedDateForInput
      };
    setEditingAssignment(formattedAssignment);
    setIsModalOpen(true);
  };
  
  const handleModalChange = (e) => setEditingAssignment({ ...editingAssignment, [e.target.name]: e.target.value });

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { 
        title: editingAssignment.title, 
        description: editingAssignment.description, 
        dueDate: editingAssignment.due_date 
      };
      const res = await axios.put(`/api/assignments/${editingAssignment.assignment_id}`, body, config);
      setAssignments(assignments.map(a => a.assignment_id === editingAssignment.assignment_id ? res.data : a));
      setIsModalOpen(false);
      setEditingAssignment(null);
    } catch (err) {
      console.error('Failed to update assignment', err);
      alert('Failed to update assignment.');
    }
  };

  return (
    <section className="content-section">
      <h1>Create and Manage Assignments</h1>
      <div className="form-card">
        <h2>Select a Class</h2>
        <div className="form-group">
          <label htmlFor="class-select">Class</label>
          <select id="class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">-- Choose a Class --</option>
            {classes.map((cls) => (<option key={cls.class_id} value={cls.class_id}>{cls.class_name} ({cls.course_code})</option>))}
          </select>
        </div>
      </div>
      {selectedClass && (
        <>
          <div className="form-card">
            <h2>Create New Assignment</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group"><label htmlFor="title">Assignment Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} required /></div>
              <div className="form-group"><label htmlFor="description">Objective / Description</label><textarea id="description" name="description" value={formData.description} onChange={handleFormChange} rows="4"></textarea></div>
              <div className="form-group"><label htmlFor="dueDate">Due Date</label><input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleFormChange} required /></div>
              <button type="submit" className="btn btn-primary">Create Assignment</button>
            </form>
          </div>
          <div className="list-card">
            <h2>Existing Assignments for this Class</h2>
            <table className="class-table">
              <thead><tr><th>Title</th><th>Due Date</th><th>Actions</th></tr></thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map(asm => (
                    <tr key={asm.assignment_id}>
                      <td>{asm.title}</td>
                      <td>{format(new Date(asm.due_date), 'dd-MM-yy')}</td>
                      <td>
                        <button onClick={() => handleEditClick(asm)} className="btn-action">View/Edit</button>
                        <button onClick={() => handleDelete(asm.assignment_id)} className="btn-action btn-delete">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (<tr><td colSpan="3">No assignments found for this class.</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Assignment</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group"><label htmlFor="edit-title">Title</label><input type="text" id="edit-title" name="title" value={editingAssignment.title} onChange={handleModalChange} required /></div>
              <div className="form-group"><label htmlFor="edit-description">Description</label><textarea id="edit-description" name="description" value={editingAssignment.description} onChange={handleModalChange} rows="4"></textarea></div>
              <div className="form-group"><label htmlFor="edit-dueDate">Due Date</label><input type="date" id="edit-dueDate" name="due_date" value={editingAssignment.due_date} onChange={handleModalChange} required /></div>
              <div style={{ marginTop: '1rem' }}><button type="submit" className="btn btn-primary">Save Changes</button><button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CreateAssignments;