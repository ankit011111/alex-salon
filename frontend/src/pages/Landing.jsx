import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Scissors, Star, MapPin, Clock, ArrowRight, Phone, ChevronRight, Sparkles, Shield, Heart } from 'lucide-react';
import { FaInstagram as Instagram } from 'react-icons/fa';
import './Landing.css';

const SERVICES_PREVIEW = [
  { icon: '✂️', title: 'Haircut & Styling', desc: 'Precision cuts by master stylists', price: 'From ₹499', category: 'haircut' },
  { icon: '🧔', title: 'Beard Grooming', desc: 'Royal trims and hot towel shaves', price: 'From ₹249', category: 'beard' },
  { icon: '💄', title: 'Makeup & Bridal', desc: 'HD makeup for every occasion', price: 'From ₹1,499', category: 'makeup' },
  { icon: '🧖', title: 'Spa & Skincare', desc: 'Rejuvenating spa treatments', price: 'From ₹599', category: 'spa' },
  { icon: '🎨', title: 'Hair Coloring', desc: 'Trendy colors & balayage', price: 'From ₹1,799', category: 'hair_coloring' },
  { icon: '✨', title: 'Facial Treatments', desc: 'Gold facials & deep cleansing', price: 'From ₹1,299', category: 'facial' },
];

const STYLISTS = [
  { name: 'Rahul Sharma', spec: 'Hair & Beard Expert', rating: 4.8, exp: '8 yrs', jobs: '1,240+' },
  { name: 'Priya Patel', spec: 'Bridal & Makeup Artist', rating: 4.9, exp: '6 yrs', jobs: '890+' },
  { name: 'Vikram Singh', spec: 'Hair Colorist', rating: 4.7, exp: '10 yrs', jobs: '1,560+' },
];

const REVIEWS = [
  { name: 'Amit K.', rating: 5, text: 'Amazing haircut! Rahul really knows his craft. Will definitely come back.', service: 'Premium Haircut' },
  { name: 'Sneha G.', rating: 5, text: 'Priya did my bridal makeup and it was absolutely stunning. Everyone complimented!', service: 'Bridal Makeup' },
  { name: 'Deepak V.', rating: 5, text: 'The royal beard grooming was worth every penny. Luxurious experience!', service: 'Royal Beard' },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar transparent />
      
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content container">
          <div className="hero-badge animate-fadeIn">
            <Sparkles size={14} /> Premium Grooming Experience
          </div>
          <h1 className="hero-title animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            The Art of<br/><em>Grooming</em>
          </h1>
          <p className="hero-subtitle animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Where precision meets luxury. Book your next appointment with Delhi's finest stylists — at our salon or at your doorstep.
          </p>
          <div className="hero-actions animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link to="/services" className="btn btn-secondary btn-lg hero-cta">
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link to="/barbers" className="btn btn-ghost btn-lg hero-cta-ghost">
              Meet Our Stylists
            </Link>
          </div>
          <div className="hero-stats animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="stat-item">
              <span className="stat-number">5,000+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Expert Stylists</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Services</span>
            <h2 className="section-title">Curated for <em>You</em></h2>
            <p className="section-desc">From classic grooming to luxury spa treatments — discover services crafted to perfection.</p>
          </div>
          <div className="services-grid">
            {SERVICES_PREVIEW.map((s, i) => (
              <Link to={`/services?category=${s.category}`} key={i} className="service-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-card-footer">
                  <span className="service-price">{s.price}</span>
                  <ChevronRight size={16} className="service-arrow" />
                </div>
              </Link>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/services" className="btn btn-outline btn-lg">
              View All Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Book in <em>3 Steps</em></h2>
          </div>
          <div className="steps-grid">
            {[
              { num: '01', title: 'Choose Service', desc: 'Browse our curated menu of grooming and beauty services.', icon: <Sparkles size={24} /> },
              { num: '02', title: 'Pick Your Stylist', desc: 'Select from our top-rated barbers and makeup artists.', icon: <Star size={24} /> },
              { num: '03', title: 'Book & Enjoy', desc: 'Choose salon visit or home service. We handle the rest.', icon: <Heart size={24} /> }
            ].map((step, i) => (
              <div key={i} className="step-card animate-fadeIn" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-number">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STYLISTS ===== */}
      <section className="section stylists-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Team</span>
            <h2 className="section-title">Meet the <em>Masters</em></h2>
            <p className="section-desc">Hand-picked artisans who transform your look with precision and passion.</p>
          </div>
          <div className="stylists-grid">
            {STYLISTS.map((s, i) => (
              <div key={i} className="stylist-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stylist-avatar-wrap">
                  <div className="stylist-avatar">{s.name.charAt(0)}</div>
                  <div className="stylist-rating-badge">
                    <Star size={12} fill="currentColor" /> {s.rating}
                  </div>
                </div>
                <h3>{s.name}</h3>
                <p className="stylist-spec">{s.spec}</p>
                <div className="stylist-meta">
                  <span><Clock size={14} /> {s.exp}</span>
                  <span><Shield size={14} /> {s.jobs} done</span>
                </div>
                <Link to="/barbers" className="btn btn-outline btn-sm w-full">View Profile</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOME SERVICE CTA ===== */}
      <section className="section home-service-section">
        <div className="container">
          <div className="home-service-card">
            <div className="home-service-content">
              <span className="section-tag" style={{ color: 'var(--secondary)' }}>Home Service</span>
              <h2>Salon Quality,<br/><em>At Your Doorstep</em></h2>
              <p>Can't make it to the salon? No problem. Our expert stylists come to you with the same premium tools and products.</p>
              <div className="home-features">
                <div className="home-feature"><MapPin size={18} /> GPS-tracked stylist</div>
                <div className="home-feature"><Clock size={18} /> On-time guarantee</div>
                <div className="home-feature"><Shield size={18} /> Safety certified</div>
              </div>
              <Link to="/services" className="btn btn-secondary btn-lg">
                Book Home Service <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="section reviews-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">What Our Clients <em>Say</em></h2>
          </div>
          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="review-stars">
                  {[...Array(r.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.service}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="navbar-brand" style={{ color: 'var(--on-primary)' }}>
                <Scissors size={24} strokeWidth={1.5} />
                <span className="brand-text">Alex <em>Salon</em></span>
              </div>
              <p>Premium grooming and beauty services in Delhi NCR. Where the art of grooming meets luxury.</p>
              <div className="footer-social">
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"><Phone size={18} /></a>
                <a href="#"><Instagram size={18} /></a>
              </div>
            </div>
            <div className="footer-links-col">
              <h4>Services</h4>
              <Link to="/services?category=haircut">Haircut & Styling</Link>
              <Link to="/services?category=beard">Beard Grooming</Link>
              <Link to="/services?category=makeup">Makeup</Link>
              <Link to="/services?category=spa">Spa & Wellness</Link>
            </div>
            <div className="footer-links-col">
              <h4>Company</h4>
              <Link to="/barbers">Our Stylists</Link>
              <Link to="/services">Book Now</Link>
              <a href="https://wa.me/919999999999">Contact Us</a>
            </div>
            <div className="footer-links-col">
              <h4>Contact</h4>
              <p>📍 Connaught Place, New Delhi</p>
              <p>📞 +91 99999 99999</p>
              <p>✉️ hello@alexsalon.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Alex Salon & Makeover. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
