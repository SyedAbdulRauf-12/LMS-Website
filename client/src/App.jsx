import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Page Imports
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './components/dashboard/DashboardHome';
import CreateAssignments from './components/dashboard/CreateAssignments';
import CreateClasses from './components/dashboard/CreateClasses';
// --- 1. IMPORT THE NEW COMPONENTS ---
import UploadTests from './components/dashboard/UploadTests';
import UploadNotes from './components/dashboard/UploadNotes';
import ClassDetails from './components/dashboard/ClassDetails';
import About from './pages/About'; // <-- IMPORT
import Help from './pages/Help';

const Home = () => (
  <section className="hero-section">
    <div className="hero-content">
      <h1>The Future of Learning is Here</h1>
      <p>Your institution's centralized hub for courses, collaboration, and success.</p>
      <Link to="/signup" className="btn btn-primary btn-large">Get Started Now</Link>
      <div className="login-prompt">
        <span>Already registered? </span>
        <Link to="/login" className="login-link">Log in here</Link>
      </div>
    </div>
  </section>
);

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />

      {/* --- Protected Student Routes --- */}
      <Route 
        path="/student/dashboard" 
        element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="assignments" element={<CreateAssignments />} />
        {/* Add other student routes here */}
        <Route path="about" element={<About />} /> {/* <-- ADD */}
        <Route path="help" element={<Help />}/>
      </Route>
      
      {/* --- Protected Teacher Routes --- */}
      <Route 
        path="/teacher/dashboard" 
        element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="create-class" element={<CreateClasses />} />
        {/* --- 2. ADD THE MISSING ROUTES HERE --- */}
        <Route path="create-assignment" element={<CreateAssignments />} />
        <Route path="upload-test" element={<UploadTests />} />
        <Route path="class/:classId" element={<ClassDetails />} />
        <Route path="upload-notes" element={<UploadNotes />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />}/>
        
      </Route>
    </Routes>
  );
}

export default App;