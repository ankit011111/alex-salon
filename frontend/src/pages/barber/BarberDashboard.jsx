import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, DollarSign, Users, Star, Check, X, Home, MapPin, TrendingUp, LogOut, Bell, ToggleLeft, ToggleRight } from 'lucide-react';
import './BarberDashboard.css';

const STATUS_COLORS = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-error' };

export default function BarberDashboard() {
  const { user, barberProfile, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(barberProfile?.isOnline || false);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [allRes, todayRes] = await Promise.all([
        api.get('/bookings/barber-bookings'),
        api.get('/bookings/barber-bookings', { params: { date: today } })
      ]);
      setBookings(allRes.data.bookings);
      setTodayBookings(todayRes.data.bookings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) { toast.error('Failed to update'); }
  };

  const toggleOnline = async () => {
    try {
      const res = await api.put('/barbers/toggle-online');
      setIsOnline(res.data.isOnline);
      toast.success(res.data.isOnline ? 'You are now online' : 'You are now offline');
    } catch (err) { toast.error('Failed to toggle'); }
  };

  const todayEarnings = todayBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.barberEarning || 0), 0);
  const pending = bookings.filter(b => b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div className="barber-dash">
      {/* Sidebar */}
      <aside className="bd-sidebar">
        <div className="bd-brand">
          <span className="bd-logo">✂️</span>
          <span>Alex <em>Salon</em></span>
        </div>
        <nav className="bd-nav">
          {[
            { key: 'dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
            { key: 'bookings', icon: <Calendar size={18} />, label: 'Bookings' },
            { key: 'schedule', icon: <Clock size={18} />, label: 'Schedule' },
          ].map(item => (
            <button key={item.key} className={`bd-nav-item ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button className="bd-nav-item bd-logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>

      {/* Main Content */}
      <main className="bd-main">
        <header className="bd-header">
          <div>
            <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="bd-header-actions">
            <button className={`online-toggle ${isOnline ? 'online' : ''}`} onClick={toggleOnline}>
              {isOnline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button className="btn btn-icon btn-ghost"><Bell size={20} /></button>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="bd-content animate-fadeIn">
            {/* Stats */}
            <div className="bd-stats">
              <div className="bd-stat-card"><div className="bsc-icon" style={{background:'rgba(197,160,89,0.1)',color:'var(--secondary)'}}><DollarSign size={20}/></div><div><span className="bsc-value">₹{todayEarnings.toLocaleString()}</span><span className="bsc-label">Today's Earnings</span></div></div>
              <div className="bd-stat-card"><div className="bsc-icon" style={{background:'var(--info-light)',color:'var(--info)'}}><Calendar size={20}/></div><div><span className="bsc-value">{todayBookings.length}</span><span className="bsc-label">Today's Bookings</span></div></div>
              <div className="bd-stat-card"><div className="bsc-icon" style={{background:'var(--warning-light)',color:'var(--warning)'}}><Clock size={20}/></div><div><span className="bsc-value">{pending.length}</span><span className="bsc-label">Pending</span></div></div>
              <div className="bd-stat-card"><div className="bsc-icon" style={{background:'var(--success-light)',color:'var(--success)'}}><Check size={20}/></div><div><span className="bsc-value">{completed.length}</span><span className="bsc-label">Completed</span></div></div>
            </div>

            {/* Today's Schedule */}
            <div className="bd-section">
              <h2>Today's Schedule</h2>
              {todayBookings.length === 0 ? (
                <p className="bd-empty">No bookings for today</p>
              ) : (
                <div className="bd-timeline">
                  {todayBookings.map(b => (
                    <div key={b._id} className="bd-timeline-item">
                      <div className="bti-time">{b.timeSlot?.start}</div>
                      <div className="bti-content">
                        <div className="bti-header">
                          <strong>{b.customer?.name}</strong>
                          <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                        </div>
                        <div className="bti-services">{b.services?.map(s => s.service?.name).join(', ')}</div>
                        <div className="bti-meta">
                          <span>{b.serviceType === 'home' ? <><Home size={13}/> Home</> : <><MapPin size={13}/> Salon</>}</span>
                          <span>₹{b.totalAmount}</span>
                        </div>
                        {b.status === 'pending' && (
                          <div className="bti-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(b._id, 'confirmed')}><Check size={14}/> Accept</button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleStatus(b._id, 'cancelled')}><X size={14}/> Decline</button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(b._id, 'completed')}><Check size={14}/> Mark Complete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Bookings */}
            {pending.length > 0 && (
              <div className="bd-section">
                <h2>Pending Requests ({pending.length})</h2>
                <div className="bd-bookings-list">
                  {pending.map(b => (
                    <div key={b._id} className="bbl-item">
                      <div className="bbl-info">
                        <strong>{b.customer?.name}</strong>
                        <span>{new Date(b.date).toLocaleDateString()} • {b.timeSlot?.start}</span>
                        <span>{b.services?.map(s => s.service?.name).join(', ')}</span>
                      </div>
                      <div className="bbl-actions">
                        <span className="bbl-amount">₹{b.totalAmount}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(b._id, 'confirmed')}><Check size={14}/></button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleStatus(b._id, 'cancelled')}><X size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance */}
            <div className="bd-section">
              <h2>Performance</h2>
              <div className="bd-perf-grid">
                <div className="bd-perf-card"><Star size={20} className="star-icon" /><strong>{barberProfile?.rating || 0}</strong><span>Rating</span></div>
                <div className="bd-perf-card"><Users size={20}/><strong>{barberProfile?.totalReviews || 0}</strong><span>Reviews</span></div>
                <div className="bd-perf-card"><Check size={20}/><strong>{barberProfile?.completedJobs || 0}</strong><span>Total Jobs</span></div>
                <div className="bd-perf-card"><DollarSign size={20}/><strong>₹{(barberProfile?.totalEarnings || 0).toLocaleString()}</strong><span>Total Earned</span></div>
              </div>
            </div>
          </div>
        )}

        {view === 'bookings' && (
          <div className="bd-content animate-fadeIn">
            <h2>All Bookings</h2>
            <div className="bd-bookings-table">
              <table>
                <thead>
                  <tr><th>Customer</th><th>Services</th><th>Date</th><th>Time</th><th>Type</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.customer?.name}</strong></td>
                      <td>{b.services?.map(s => s.service?.name).join(', ')}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{b.timeSlot?.start}</td>
                      <td><span className={`badge ${b.serviceType === 'home' ? 'badge-info' : 'badge-success'}`}>{b.serviceType}</span></td>
                      <td><strong>₹{b.totalAmount}</strong></td>
                      <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                      <td>
                        {b.status === 'pending' && <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(b._id, 'confirmed')}>Accept</button>}
                        {b.status === 'confirmed' && <button className="btn btn-sm btn-primary" onClick={() => handleStatus(b._id, 'completed')}>Complete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'schedule' && (
          <div className="bd-content animate-fadeIn">
            <h2>Weekly Schedule</h2>
            <div className="bd-schedule-grid">
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                const dayData = barberProfile?.availability?.[day];
                return (
                  <div key={day} className={`bd-schedule-day ${dayData?.isAvailable ? '' : 'closed'}`}>
                    <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    {dayData?.isAvailable ? (
                      <div className="sd-slots">
                        {dayData.slots?.map((s, i) => <span key={i} className="sd-slot">{s.start} - {s.end}</span>)}
                      </div>
                    ) : <span className="sd-closed">Day Off</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
