import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // 1. Check for the token (the "wristband") in local storage
  const token = localStorage.getItem('token');

  // 2. If there is NO token, redirect the user to the login page
  if (!token) {
    // The 'replace' prop is important for the user's browser history
    return <Navigate to="/login" replace />;
  }

  // 3. If there IS a token, show the page the user wanted to see
  return children;
}

export default ProtectedRoute;