import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Search, SlidersHorizontal, Star, Clock, Home, MapPin, X } from 'lucide-react';
import './Services.css';

const CATEGORIES = [
  { key: '', label: 'All', icon: '✨' },
  { key: 'haircut', label: 'Haircut', icon: '✂️' },
  { key: 'beard', label: 'Beard', icon: '🧔' },
  { key: 'makeup', label: 'Makeup', icon: '💄' },
  { key: 'bridal', label: 'Bridal', icon: '👰' },
  { key: 'facial', label: 'Facial', icon: '🧖' },
  { key: 'spa', label: 'Spa', icon: '💆' },
  { key: 'hair_coloring', label: 'Coloring', icon: '🎨' },
  { key: 'skincare', label: 'Skincare', icon: '🌿' },
];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [homeOnly, setHomeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [category, sort, homeOnly]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (sort) params.sort = sort;
      if (homeOnly) params.homeService = true;
      if (search) params.search = search;
      const res = await api.get('/services', { params });
      setServices(res.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="services-page">
      <Navbar />
      
      <div className="services-hero">
        <div className="container">
          <h1>Discover Our <em>Services</em></h1>
          <p>Choose from our curated collection of premium grooming and beauty services</p>
          <form onSubmit={handleSearch} className="services-search">
            <Search size={20} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="input-field" />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
        </div>
      </div>

      <div className="container services-content">
        {/* Categories */}
        <div className="categories-scroll">
          {CATEGORIES.map(c => (
            <button key={c.key} className={`category-chip ${category === c.key ? 'active' : ''}`} onClick={() => { setCategory(c.key); setSearchParams(c.key ? { category: c.key } : {}); }}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="services-toolbar">
          <p className="results-count">{services.length} services found</p>
          <div className="toolbar-actions">
            <div className="sort-wrap">
              <select value={sort} onChange={e => setSort(e.target.value)} className="input-field sort-select">
                <option value="">Sort by</option>
                <option value="price_low">Price: Low → High</option>
                <option value="price_high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <button className={`btn btn-outline btn-sm ${homeOnly ? 'active-filter' : ''}`} onClick={() => setHomeOnly(!homeOnly)}>
              <Home size={16} /> Home Service {homeOnly && <X size={14} />}
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No services found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="services-listing">
            {services.map((s, i) => (
              <div key={s._id} className="service-list-card animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="slc-image">
                  <div className="slc-image-placeholder">{CATEGORIES.find(c => c.key === s.category)?.icon || '✨'}</div>
                  {s.isPopular && <span className="badge badge-gold slc-badge">Popular</span>}
                  {s.isTrending && <span className="badge badge-primary slc-badge slc-badge-alt">Trending</span>}
                </div>
                <div className="slc-content">
                  <div className="slc-top">
                    <span className="slc-category">{s.category.replace('_', ' ')}</span>
                    {s.homeServiceAvailable && <span className="slc-home-tag"><Home size={12} /> Home</span>}
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="slc-meta">
                    <span className="slc-duration"><Clock size={14} /> {s.duration} min</span>
                    {s.rating > 0 && <span className="slc-rating"><Star size={14} fill="currentColor" /> {s.rating}</span>}
                    {s.gender !== 'unisex' && <span className="slc-gender">{s.gender === 'male' ? '♂' : '♀'} {s.gender}</span>}
                  </div>
                </div>
                <div className="slc-action">
                  <div className="slc-price">
                    {s.discountPrice ? (
                      <>
                        <span className="price-old">₹{s.price}</span>
                        <span className="price-current">₹{s.discountPrice}</span>
                      </>
                    ) : (
                      <span className="price-current">₹{s.price}</span>
                    )}
                  </div>
                  {s.homeServiceAvailable && s.homeServiceExtraCharge > 0 && (
                    <span className="home-extra">+₹{s.homeServiceExtraCharge} for home</span>
                  )}
                  <Link to="/barbers" className="btn btn-secondary btn-sm">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
