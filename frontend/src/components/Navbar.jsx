import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG icon components for navigation items
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const CropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

const DiseaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    <path d="M11 8v6" /><path d="M8 11h6" />
  </svg>
);

const WeatherIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const MarketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Navigation items configuration
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/crop', label: 'Crop AI', icon: <CropIcon /> },
  { to: '/disease', label: 'Disease AI', icon: <DiseaseIcon /> },
  { to: '/weather', label: 'Weather', icon: <WeatherIcon /> },
  { to: '/market', label: 'Market', icon: <MarketIcon /> },
];

// Sidebar nav on desktop + bottom tab bar on mobile
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logs the user out and redirects to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ---- Desktop Sidebar ---- */}
      <aside className="sidebar">
        {/* Brand logo */}
        <div className="sidebar-brand">
          <span className="sidebar-logo">🌾</span>
          <h1 className="sidebar-title">KishanAi</h1>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'Farmer'}</p>
              <p className="sidebar-user-email">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout">
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ---- Mobile Bottom Navigation ---- */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
