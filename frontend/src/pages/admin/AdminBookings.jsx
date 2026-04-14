import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Search, Filter, Eye, Check, X } from 'lucide-react';

const STATUS_COLORS = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-error', no_show: 'badge-error' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchBookings(); }, [status, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (status) params.status = status;
      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data.bookings);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <AdminSidebar>
      <div className="admin-page-header">
        <h1>Bookings Management</h1>
        <p>View and manage all appointments</p>
      </div>
      <div className="admin-content">
        {/* Filters */}
        <div className="admin-toolbar">
          <div className="at-filters">
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`category-chip ${status === s ? 'active' : ''}`} onClick={() => { setStatus(s); setPage(1); }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <span className="at-count">{total} bookings</span>
        </div>

        {/* Table */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th><th>Barber</th><th>Services</th><th>Date & Time</th>
                  <th>Type</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--outline)' }}>No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.customer?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>{b.customer?.phone}</div>
                    </td>
                    <td>{b.barber?.user?.name}</td>
                    <td style={{ maxWidth: 200 }}>{b.services?.map(s => s.service?.name).join(', ')}</td>
                    <td>
                      <div>{new Date(b.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>{b.timeSlot?.start} - {b.timeSlot?.end}</div>
                    </td>
                    <td><span className={`badge ${b.serviceType === 'home' ? 'badge-info' : 'badge-success'}`}>{b.serviceType}</span></td>
                    <td><strong>₹{b.totalAmount}</strong></td>
                    <td><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{b.paymentStatus}</span></td>
                    <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {b.status === 'pending' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(b._id, 'confirmed')} title="Confirm"><Check size={14} /></button>
                            <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b._id, 'cancelled')} title="Cancel"><X size={14} /></button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b._id, 'completed')}>Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span>Page {page} of {Math.ceil(total / 15)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
