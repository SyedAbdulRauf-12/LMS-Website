import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

function DashboardLayout({ navLinks, userName }) {
  const navigate = useNavigate();

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
            <span>Welcome, {userName || 'User'}!</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Log Out
          </button>
        </header>
        
        <div className="content-area">
          {/* Outlet is a placeholder from React Router. 
              This is where the content of our child routes will be rendered. */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;