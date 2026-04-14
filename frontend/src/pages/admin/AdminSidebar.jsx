import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Calendar, Users, Settings, LogOut, Scissors, CreditCard, Tag } from 'lucide-react';
import './AdminLayout.css';

export default function AdminSidebar({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { to: '/admin/bookings', icon: <Calendar size={18} />, label: 'Bookings' },
    { to: '/admin/barbers', icon: <Users size={18} />, label: 'Barbers' },
    { to: '/admin/services', icon: <Scissors size={18} />, label: 'Services' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="as-brand">
          <Scissors size={22} strokeWidth={1.5} />
          <span>Alex <em>Salon</em></span>
        </div>
        <span className="as-role-badge">Admin Panel</span>

        <nav className="as-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`as-nav-item ${location.pathname === l.to ? 'active' : ''}`}>
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>

        <div className="as-user">
          <div className="as-user-avatar">{user?.name?.charAt(0)}</div>
          <div className="as-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="as-nav-item as-logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
