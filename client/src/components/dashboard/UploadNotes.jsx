import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UploadNotes() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', drive_link: '' });

  // Fetch the teacher's classes
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

  // Fetch notes for the selected class
  useEffect(() => {
    if (!selectedClass) { setNotes([]); return; }
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      try {
        const res = await axios.get(`/api/classes/${selectedClass}/notes`, config);
        setNotes(res.data);
      } catch (err) { console.error('Failed to fetch notes', err); }
    };
    fetchNotes();
  }, [selectedClass]);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) { alert('Please select a class first.'); return; }
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      const res = await axios.post(`/api/classes/${selectedClass}/notes`, formData, config);
      setNotes([res.data, ...notes]);
      setFormData({ title: '', drive_link: '' });
    } catch (err) { console.error('Failed to upload note', err); }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`/api/notes/${noteId}`, config);
      setNotes(notes.filter(n => n.note_id !== noteId));
    } catch (err) {
      console.error('Failed to delete note', err);
      alert('Failed to delete note.');
    }
  };

  return (
    <section className="content-section">
      <h1>Upload and Manage Notes</h1>

      <div className="form-card">
        <h2>Select a Class</h2>
        <div className="form-group">
          <label htmlFor="class-select">Class</label>
          <select id="class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">-- Choose a Class --</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>{cls.class_name} ({cls.course_code})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && (
        <>
          <div className="form-card">
            <h2>Upload New Notes</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Note Title / Description</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="drive_link">Google Drive Link</label>
                <input type="url" id="drive_link" name="drive_link" value={formData.drive_link} onChange={handleFormChange} placeholder="https://docs.google.com/..." required />
              </div>
              <button type="submit" className="btn btn-primary">Upload Note</button>
            </form>
          </div>

          <div className="list-card">
            <h2>Existing Notes for this Class</h2>
            <table className="class-table">
              <thead><tr><th>Title</th><th>Link</th><th>Actions</th></tr></thead>
              <tbody>
                {notes.length > 0 ? (
                  notes.map(note => (
                    <tr key={note.note_id}>
                      <td>{note.title}</td>
                      <td><a href={note.drive_link} target="_blank" rel="noopener noreferrer">Open Link</a></td>
                      <td><button onClick={() => handleDelete(note.note_id)} className="btn-action btn-delete">Delete</button></td>
                    </tr>
                  ))
                ) : (<tr><td colSpan="3">No notes found for this class.</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default UploadNotes;