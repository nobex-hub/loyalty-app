import { NavLink } from 'react-router-dom';

export default function BottomNav({ unreadCount = 0 }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <span className="nav-icon">{'\uD83C\uDFE0'}</span>
        Home
      </NavLink>
      <NavLink to="/scan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">{'\uD83D\uDCF7'}</span>
        Scan
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon nav-icon-badge">
          {'\uD83D\uDD14'}
          {unreadCount > 0 && <span className="badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </span>
        Alerts
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">{'\uD83D\uDCCB'}</span>
        History
      </NavLink>
      <NavLink to="/stores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">{'\uD83C\uDFEA'}</span>
        Stores
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">{'\uD83D\uDC64'}</span>
        Profile
      </NavLink>
    </nav>
  );
}
