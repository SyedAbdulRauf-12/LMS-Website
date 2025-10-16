import React from 'react';

function About() {
  return (
    <section className="content-section">
      <h1>About This LMS</h1>
      
      <div className="form-card">
        <h2>Our Mission</h2>
        <p>
          This Learning Management System (LMS) was designed to provide a seamless, integrated, and user-friendly platform for students and teachers. Our goal is to simplify the management of academic materials, assignments, and communication, fostering a more effective learning environment.
          This project is my attempt to combine my skills in programming and web development with my interest in education. I built it to create a platform where teachers and students can collaborate more effectively — from managing assignments and marks to communicating seamlessly.
          The project also reflects my learning journey in full stack development and serves as a foundation for future enhancements, such as role-based access, digital signatures, and integrated discussions.
        </p>
      </div>

      <div className="form-card">
        <h2>Created By</h2>
        <h3>Syed Abdul Rauf</h3>
        <p>
          Hi, I’m Syed, a passionate web developer. I enjoy building practical applications that solve real-world problems and help people connect, learn, and grow. My main motivation to build this was the developers of vtucircle.
          If they could build a site that made VTU students life easier, I believed I can also build something like that or even better as someone who studied the same stream.
        </p>
      </div>
    </section>
  );
}

export default About;