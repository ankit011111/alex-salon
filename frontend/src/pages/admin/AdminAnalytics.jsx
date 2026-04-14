import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Users } from 'lucide-react';

const COLORS = ['#C5A059', '#030612', '#8E6E53', '#2e7d32', '#1565c0', '#f57f17', '#6a1b9a', '#c62828'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(res => { setAnalytics(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <AdminSidebar><div className="page-loader"><div className="loader-spinner" /></div></AdminSidebar>;

  return (
    <AdminSidebar>
      <div className="admin-page-header">
        <h1>Analytics</h1>
        <p>Deep insights into your business performance</p>
      </div>
      <div className="admin-content">
        <div className="admin-grid-2">
          {/* Top Services */}
          <div className="admin-card">
            <h3><Award size={18} /> Top Services</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.topServices?.slice(0, 6) || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="count" fill="#C5A059" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Barbers */}
          <div className="admin-card">
            <h3><Users size={18} /> Top Barbers by Revenue</h3>
            <div className="top-barbers-list">
              {analytics?.topBarbers?.map((b, i) => (
                <div key={i} className="tb-item">
                  <div className="tb-rank">#{i + 1}</div>
                  <div className="tb-info">
                    <strong>{b.name}</strong>
                    <span>{b.bookings} bookings • ⭐ {b.rating}</span>
                  </div>
                  <div className="tb-revenue">₹{b.totalRevenue?.toLocaleString()}</div>
                </div>
              ))}
              {(!analytics?.topBarbers || analytics.topBarbers.length === 0) && (
                <p style={{ color: 'var(--outline)', textAlign: 'center', padding: 'var(--space-5)' }}>No data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="admin-grid-2">
          {/* Peak Hours */}
          <div className="admin-card">
            <h3><Clock size={18} /> Peak Booking Hours</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => `${v}:00`} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Bookings']} labelFormatter={v => `${v}:00 hrs`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="count" fill="#1a1f2c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Split */}
          <div className="admin-card">
            <h3><TrendingUp size={18} /> Customer Retention</h3>
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New', value: analytics?.customerInsights?.newCustomers || 0 },
                      { name: 'Returning', value: analytics?.customerInsights?.returningCustomers || 0 }
                    ]}
                    dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}
                  >
                    <Cell fill="#C5A059" />
                    <Cell fill="#030612" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                <div className="pie-legend-item"><span className="pie-dot" style={{ background: '#C5A059' }} /> New: {analytics?.customerInsights?.newCustomers || 0}</div>
                <div className="pie-legend-item"><span className="pie-dot" style={{ background: '#030612' }} /> Returning: {analytics?.customerInsights?.returningCustomers || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
