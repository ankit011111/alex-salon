import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Star, Clock, Shield, MapPin, Home, Phone, Award, ChevronRight } from 'lucide-react';
import './BarberProfile.css';

export default function BarberProfile() {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          api.get(`/barbers/${id}`),
          api.get(`/reviews/barber/${id}`)
        ]);
        setBarber(bRes.data.barber);
        setReviews(rRes.data.reviews);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <><Navbar /><div className="page-loader"><div className="loader-spinner" /></div></>;
  if (!barber) return <><Navbar /><div className="empty-state" style={{ paddingTop: 200 }}><h3>Stylist not found</h3></div></>;

  return (
    <div className="barber-profile-page">
      <Navbar />
      
      <div className="bp-hero">
        <div className="container">
          <div className="bp-hero-inner">
            <div className="bp-avatar-large">{barber.user?.name?.charAt(0)}</div>
            <div className="bp-hero-info">
              <div className="bp-badges-row">
                {barber.isTopRated && <span className="badge badge-gold">⭐ Top Rated</span>}
                {barber.isOnline && <span className="badge badge-success">🟢 Online Now</span>}
                {barber.homeServiceAvailable && <span className="badge badge-info"><Home size={12} /> Home Visits</span>}
              </div>
              <h1>{barber.user?.name}</h1>
              <p className="bp-spec">{barber.specializations?.join(' • ')}</p>
              <p className="bp-bio">{barber.bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container bp-content">
        <div className="bp-grid">
          <div className="bp-main">
            {/* Stats */}
            <div className="bp-stats-row">
              <div className="bp-stat-card">
                <Star size={20} className="stat-icon" />
                <strong>{barber.rating}</strong>
                <span>{barber.totalReviews} reviews</span>
              </div>
              <div className="bp-stat-card">
                <Clock size={20} className="stat-icon" />
                <strong>{barber.experience} yrs</strong>
                <span>Experience</span>
              </div>
              <div className="bp-stat-card">
                <Shield size={20} className="stat-icon" />
                <strong>{barber.completedJobs}</strong>
                <span>Jobs done</span>
              </div>
              <div className="bp-stat-card">
                <MapPin size={20} className="stat-icon" />
                <strong>{barber.salon?.split('-').pop()?.trim()}</strong>
                <span>Location</span>
              </div>
            </div>

            {/* Services */}
            <div className="bp-section">
              <h2>Services Offered</h2>
              <div className="bp-services-list">
                {barber.services?.map(s => (
                  <div key={s._id} className="bp-service-item">
                    <div>
                      <h4>{s.name}</h4>
                      <span className="bp-service-meta"><Clock size={13} /> {s.duration} min • {s.category}</span>
                    </div>
                    <strong>₹{s.price}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bp-section">
              <h2>Client Reviews</h2>
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet</p>
              ) : (
                <div className="bp-reviews">
                  {reviews.map(r => (
                    <div key={r._id} className="bp-review">
                      <div className="bp-review-header">
                        <div className="bp-review-avatar">{r.customer?.name?.charAt(0)}</div>
                        <div>
                          <strong>{r.customer?.name}</strong>
                          <div className="bp-review-stars">
                            {[...Array(r.rating)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                          </div>
                        </div>
                        <span className="bp-review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bp-sidebar">
            <div className="bp-book-card">
              <h3>Book with {barber.user?.name?.split(' ')[0]}</h3>
              <p>Select services, choose date & time, and book your appointment.</p>
              <Link to={`/book/${barber._id}`} className="btn btn-secondary btn-lg w-full">
                Book Appointment <ChevronRight size={18} />
              </Link>
              <a href={`https://wa.me/91${barber.user?.phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <Phone size={16} /> Chat on WhatsApp
              </a>
            </div>

            {/* Availability Preview */}
            <div className="bp-avail-card">
              <h4>Weekly Availability</h4>
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                <div key={day} className="bp-avail-row">
                  <span className="bp-avail-day">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</span>
                  {barber.availability?.[day]?.isAvailable ? (
                    <span className="bp-avail-time">{barber.availability[day].slots?.[0]?.start} - {barber.availability[day].slots?.[0]?.end}</span>
                  ) : (
                    <span className="bp-avail-closed">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
