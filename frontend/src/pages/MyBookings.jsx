import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Star, Home, X, Check, RefreshCw } from 'lucide-react';
import './MyBookings.css';

const STATUS_COLORS = {
  pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary',
  completed: 'badge-success', cancelled: 'badge-error', no_show: 'badge-error'
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await api.get('/bookings/my-bookings', { params });
      setBookings(res.data.bookings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/status`, { status: 'cancelled', cancelReason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const handleReview = async () => {
    try {
      await api.post('/reviews', {
        barberId: reviewModal.barber._id,
        bookingId: reviewModal._id,
        serviceId: reviewModal.services[0]?.service?._id,
        ...reviewData
      });
      toast.success('Review submitted! ⭐');
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  return (
    <div className="mybookings-page">
      <Navbar />
      <div className="container mybookings-content">
        <h1>My <em>Bookings</em></h1>

        <div className="mb-filters">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`category-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid"><div className="skeleton-card" style={{ height: 160 }} /><div className="skeleton-card" style={{ height: 160 }} /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📅</span><h3>No bookings found</h3><p>Book your first appointment today!</p></div>
        ) : (
          <div className="mb-list">
            {bookings.map(b => (
              <div key={b._id} className="mb-card animate-fadeIn">
                <div className="mb-card-header">
                  <div className="mb-stylist">
                    <div className="mb-avatar">{b.barber?.user?.name?.charAt(0)}</div>
                    <div>
                      <strong>{b.barber?.user?.name}</strong>
                      <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="mb-amount">₹{b.totalAmount}</div>
                </div>

                <div className="mb-details">
                  <span><Calendar size={14} /> {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span><Clock size={14} /> {b.timeSlot?.start} - {b.timeSlot?.end}</span>
                  <span>{b.serviceType === 'home' ? <><Home size={14} /> Home</> : <><MapPin size={14} /> Salon</>}</span>
                </div>

                <div className="mb-services">
                  {b.services?.map((s, i) => (
                    <span key={i} className="bc-service-tag">{s.service?.name}</span>
                  ))}
                </div>

                <div className="mb-actions">
                  {b.status === 'completed' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(b)}>
                      <Star size={14} /> Write Review
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleCancel(b._id)}>
                      <X size={14} /> Cancel
                    </button>
                  )}
                  {b.barber?.user?.phone && (
                    <a href={`https://wa.me/91${b.barber.user.phone}`} target="_blank" className="btn btn-ghost btn-sm" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h3>Rate Your Experience</h3>
            <p>How was your session with {reviewModal.barber?.user?.name}?</p>
            <div className="review-stars-input">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewData({...reviewData, rating: n})} className={n <= reviewData.rating ? 'star-active' : ''}>
                  <Star size={28} fill={n <= reviewData.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea className="input-field" rows={3} value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} placeholder="Share your experience..." />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-secondary" onClick={handleReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
