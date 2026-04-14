import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Star, Clock, Shield, MapPin, Home, Search } from 'lucide-react';
import './BarberList.css';

export default function BarberList() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchBarbers(); }, []);

  const fetchBarbers = async () => {
    try {
      const res = await api.get('/barbers');
      setBarbers(res.data.barbers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = barbers.filter(b =>
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.specializations?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="barber-list-page">
      <Navbar />
      <div className="barbers-hero">
        <div className="container">
          <h1>Our <em>Stylists</em></h1>
          <p>Meet the masters behind the magic. Choose your perfect stylist.</p>
        </div>
      </div>

      <div className="container barbers-content">
        <div className="barbers-search-bar">
          <Search size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialization..." className="input-field" />
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 320 }} />)}
          </div>
        ) : (
          <div className="barbers-grid">
            {filtered.map((b, i) => (
              <div key={b._id} className="barber-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="bc-header">
                  <div className="bc-avatar">{b.user?.name?.charAt(0)}</div>
                  {b.isTopRated && <span className="badge badge-gold">⭐ Top Rated</span>}
                  {b.isOnline && <span className="bc-online-dot" />}
                </div>
                <h3>{b.user?.name}</h3>
                <p className="bc-spec">{b.specializations?.join(' • ')}</p>
                
                <div className="bc-stats">
                  <div><Star size={14} fill="currentColor" className="star-icon" /> <strong>{b.rating}</strong> ({b.totalReviews})</div>
                  <div><Clock size={14} /> {b.experience} yrs</div>
                  <div><Shield size={14} /> {b.completedJobs} jobs</div>
                </div>

                <div className="bc-services">
                  {b.services?.slice(0, 3).map(s => (
                    <span key={s._id} className="bc-service-tag">{s.name}</span>
                  ))}
                  {b.services?.length > 3 && <span className="bc-service-tag bc-more">+{b.services.length - 3}</span>}
                </div>

                <div className="bc-footer">
                  <div className="bc-features">
                    {b.homeServiceAvailable && <span className="bc-feature"><Home size={12} /> Home visit</span>}
                    <span className="bc-feature"><MapPin size={12} /> {b.salon?.split('-').pop()?.trim() || 'Main Branch'}</span>
                  </div>
                  <Link to={`/barbers/${b._id}`} className="btn btn-secondary btn-sm">View & Book</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
