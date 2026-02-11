import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>⭐ Loyalty</h1>
        <p>Admin Panel</p>
      </div>

      <nav>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <span className="nav-emoji">📊</span> Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-emoji">📦</span> Products
        </NavLink>
        <NavLink to="/reviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-emoji">📝</span> Review Queue
        </NavLink>
        <NavLink to="/stores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-emoji">🏪</span> Stores
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-emoji">👥</span> Users
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-emoji">📈</span> Analytics
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-theme-toggle">
          <ThemeToggle />
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
