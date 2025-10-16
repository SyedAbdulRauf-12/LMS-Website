import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function DashboardLayout({ navLinks, userName }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>LMS Portal</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.name}>
                {/* NavLink is special: it automatically adds an 'active' class
                    to the link that matches the current URL. */}
                <NavLink to={link.path} className="nav-link" end>
                  {link.name}
                </NavLink>
              </li>
            ))}
            <li className="nav-divider"></li>
              <li><NavLink to="help" className="nav-link">Help</NavLink></li>
              <li><NavLink to="about" className="nav-link">About</NavLink></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="user-info">
            {/* Use the user's full_name from the context */}
            <span>Welcome, {user ? user.full_name : 'User'}!</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Log Out
          </button>
        </header>
        
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;