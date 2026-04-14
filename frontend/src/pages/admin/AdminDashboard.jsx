import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../utils/api';
import { DollarSign, Users, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Home, MapPin, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#C5A059', '#030612', '#8E6E53', '#2e7d32', '#1565c0', '#f57f17'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dRes, aRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics')
        ]);
        setData(dRes.data);
        setAnalytics(aRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <AdminSidebar><div className="page-loader"><div className="loader-spinner" /></div></AdminSidebar>;

  const statusData = data?.bookingsByStatus?.map(b => ({ name: b._id, value: b.count })) || [];

  return (
    <AdminSidebar>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Real-time business insights for Alex Salon</p>
      </div>

      <div className="admin-content">
        {/* KPI Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="asc-icon" style={{ background: 'rgba(197,160,89,0.1)', color: 'var(--secondary)' }}><DollarSign size={22} /></div>
            <div>
              <span className="asc-value">₹{(data?.revenue?.total || 0).toLocaleString()}</span>
              <span className="asc-label">Total Revenue</span>
              <span className="asc-change up"><ArrowUpRight size={12} /> This month: ₹{(data?.revenue?.thisMonth || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}><Calendar size={22} /></div>
            <div>
              <span className="asc-value">{data?.overview?.totalBookings || 0}</span>
              <span className="asc-label">Total Bookings</span>
              <span className="asc-change up"><ArrowUpRight size={12} /> Today: {data?.overview?.todayBookings || 0}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><Users size={22} /></div>
            <div>
              <span className="asc-value">{data?.overview?.totalUsers || 0}</span>
              <span className="asc-label">Customers</span>
              <span className="asc-change up"><ArrowUpRight size={12} /> {data?.overview?.totalBarbers || 0} barbers</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><TrendingUp size={22} /></div>
            <div>
              <span className="asc-value">{data?.overview?.conversionRate || 0}%</span>
              <span className="asc-label">Conversion Rate</span>
              <span className="asc-change down"><ArrowDownRight size={12} /> Cancel: {data?.overview?.cancellationRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="admin-grid-2">
          {/* Revenue Trend */}
          <div className="admin-card">
            <h3>Revenue Trend (30 Days)</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.revenueTrend || []}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C5A059" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C5A059" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(-5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie */}
          <div className="admin-card">
            <h3>Booking Status Split</h3>
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                      {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p style={{ color: 'var(--outline)' }}>No booking data</p>}
              <div className="pie-legend">
                {statusData.map((s, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span>{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-grid-2">
          {/* Service Type Split */}
          <div className="admin-card">
            <h3>Service Location Split</h3>
            <div className="split-bars">
              <div className="split-bar">
                <div className="sb-label"><MapPin size={16} /> Salon Visits</div>
                <div className="sb-bar"><div className="sb-fill" style={{ width: `${((data?.serviceTypeSplit?.salon || 0) / ((data?.serviceTypeSplit?.salon || 0) + (data?.serviceTypeSplit?.home || 0) || 1)) * 100}%`, background: 'var(--primary)' }} /></div>
                <span className="sb-value">{data?.serviceTypeSplit?.salon || 0}</span>
              </div>
              <div className="split-bar">
                <div className="sb-label"><Home size={16} /> Home Service</div>
                <div className="sb-bar"><div className="sb-fill" style={{ width: `${((data?.serviceTypeSplit?.home || 0) / ((data?.serviceTypeSplit?.salon || 0) + (data?.serviceTypeSplit?.home || 0) || 1)) * 100}%`, background: 'var(--secondary)' }} /></div>
                <span className="sb-value">{data?.serviceTypeSplit?.home || 0}</span>
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="admin-card">
            <h3>Customer Insights</h3>
            <div className="insight-boxes">
              <div className="insight-box">
                <span className="ib-num">{analytics?.customerInsights?.newCustomers || 0}</span>
                <span className="ib-label">New Customers</span>
              </div>
              <div className="insight-box">
                <span className="ib-num">{analytics?.customerInsights?.returningCustomers || 0}</span>
                <span className="ib-label">Returning</span>
              </div>
              <div className="insight-box">
                <span className="ib-num">₹{Math.round(((data?.revenue?.total || 0) / ((data?.overview?.totalUsers || 1))) || 0)}</span>
                <span className="ib-label">Avg LTV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="admin-card">
          <h3>
            Recent Bookings
            <a href="/admin/bookings" className="btn btn-ghost btn-sm">View All <Eye size={14} /></a>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Customer</th><th>Barber</th><th>Services</th><th>Date</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data?.recentBookings?.slice(0, 8).map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.customer?.name}</strong></td>
                    <td>{b.barber?.user?.name}</td>
                    <td>{b.services?.map(s => s.service?.name).join(', ')}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td><strong>₹{b.totalAmount}</strong></td>
                    <td><span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'confirmed' ? 'badge-info' : b.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
