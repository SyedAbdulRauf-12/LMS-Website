import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

// Define the navigation links for the teacher
const teacherNavLinks = [
  { name: 'Dashboard', path: '/teacher/dashboard' },
  { name: 'Create Classes', path: '/teacher/dashboard/create-class' },
  { name: 'Create Assignments', path: '/teacher/dashboard/create-assignment' },
  { name: 'Upload Tests', path: '/teacher/dashboard/upload-test' },
   { name: 'Upload Notes', path: '/teacher/dashboard/upload-notes' },
];

function TeacherDashboard() {
  const userName = "Prof. Gemini";

  return (
    <DashboardLayout navLinks={teacherNavLinks} userName={userName} />
  );
}

export default TeacherDashboard;