import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

// Define the navigation links for the student
const studentNavLinks = [
  { name: 'Dashboard', path: '/student/dashboard' },
  { name: 'My Classes', path: '/student/dashboard/my-classes' },
  { name: 'My Assignments', path: '/student/dashboard/assignments' },
  { name: 'My Tests', path: '/student/dashboard/tests' },
];

function StudentDashboard() {
  // In a real app, you would fetch the user's name from an API
  const userName = "Ameen"; 

  return (
    <DashboardLayout navLinks={studentNavLinks} userName={userName} />
  );
}

export default StudentDashboard;