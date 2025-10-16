import React, { useState } from 'react';

function Help() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send an email or save to a database.
    alert('Thank you for your message! An admin will get back to you shortly.');
    console.log('Contact form submitted:', formData);
    setFormData({ name: '', email: '', message: '' }); // Clear the form
  };

  return (
    <section className="content-section">
      <h1>Help & Support</h1>
      
      <div className="list-card">
        <h2>Frequently Asked Questions (FAQ)</h2>
        
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>How do I change my password?</summary>
          <p style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            Currently, password changes must be requested through a system administrator. Please use the contact form below to request a password reset.
          </p>
        </details>

        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>Where can I see my grades?</summary>
          <p style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            The 'My Grades' section is under development and will be available soon. It will appear in your dashboard sidebar once released.
          </p>
        </details>

         <details>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>How do I enroll in a new class?</summary>
          <p style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            Class enrollment is managed by your teachers or department administrators. If you believe you are missing a class, please contact your teacher.
          </p>
        </details>
      </div>

      <div className="form-card">
        <h2>Didn't find what you are looking for?</h2>
        <p>Contact an administrator directly with your query.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </div>
    </section>
  );
}

export default Help;