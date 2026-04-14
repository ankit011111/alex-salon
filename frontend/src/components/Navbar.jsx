import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Menu, X, User, LogOut, Calendar, ChevronDown } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ transparent }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${transparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <Scissors size={24} strokeWidth={1.5} />
          <span className="brand-text">Alex <em>Salon</em></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          <Link to="/services" onClick={() => setMobileOpen(false)}>Services</Link>
          <Link to="/barbers" onClick={() => setMobileOpen(false)}>Our Stylists</Link>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>WhatsApp</a>
          
          {user ? (
            <div className="nav-user" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <button className="nav-user-btn">
                <div className="nav-avatar">{user.name?.charAt(0)}</div>
                <span>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown animate-scaleIn">
                  {user.role === 'customer' && (
                    <Link to="/my-bookings" onClick={() => { setDropdownOpen(false); setMobileOpen(false); }}>
                      <Calendar size={16} /> My Bookings
                    </Link>
                  )}
                  {user.role === 'barber' && (
                    <Link to="/barber" onClick={() => { setDropdownOpen(false); setMobileOpen(false); }}>
                      <User size={16} /> Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => { setDropdownOpen(false); setMobileOpen(false); }}>
                      <User size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-logout">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm nav-login-btn" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
