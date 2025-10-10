import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import RoleBadge from './RoleBadge.jsx';
import './Layout.css';

const navigation = [
  { to: '/', label: 'Dashboard', roles: ['ATHLETE', 'SPECIALIST', 'ADMIN'], end: true },
  { to: '/athlete', label: 'Profile', roles: ['ATHLETE'] },
  { to: '/training-plans', label: 'Training Plans', roles: ['ATHLETE', 'SPECIALIST', 'ADMIN'] },
  { to: '/nutrition-plans', label: 'Nutrition Plans', roles: ['ATHLETE', 'SPECIALIST', 'ADMIN'] },
  { to: '/messages', label: 'Messages', roles: ['ATHLETE', 'SPECIALIST', 'ADMIN'] }
];

const Layout = () => {
  const { user, logout } = useAuth();

  const links = navigation.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <span className="app-shell__logo">EH</span>
          <div>
            <h1 className="app-shell__title">EnduranceHub</h1>
            <p className="app-shell__subtitle">Unified performance platform</p>
          </div>
        </div>
        <nav className="app-shell__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'app-shell__nav-link app-shell__nav-link--active' : 'app-shell__nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="app-shell__content">
        <header className="app-shell__header">
          <div>
            <h2 className="app-shell__welcome">Welcome back, {user.firstName}!</h2>
            <p className="app-shell__role">
              <RoleBadge role={user.role} />
            </p>
          </div>
          <button className="app-shell__logout" onClick={logout} type="button">
            Sign out
          </button>
        </header>
        <div className="app-shell__main">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
