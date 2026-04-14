import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, Clock, Home, MapPin, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './BookingPage.css';

export default function BookingPage() {
  const { barberId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [serviceType, setServiceType] = useState('salon');
  const [homeAddress, setHomeAddress] = useState({ street: '', city: '', pincode: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/barbers/${barberId}`).then(res => { setBarber(res.data.barber); setLoading(false); }).catch(() => setLoading(false));
  }, [barberId]);

  useEffect(() => {
    if (selectedDate && barberId) {
      api.get(`/barbers/${barberId}/slots`, { params: { date: selectedDate } })
        .then(res => { setSlots(res.data.slots); setSelectedSlot(null); });
    }
  }, [selectedDate, barberId]);

  const toggleService = (service) => {
    setSelectedServices(prev => prev.find(s => s._id === service._id) ? prev.filter(s => s._id !== service._id) : [...prev, service]);
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + (s.discountPrice || s.price), 0);
  const homeCharge = serviceType === 'home' ? selectedServices.reduce((sum, s) => sum + (s.homeServiceExtraCharge || 0), 0) + 100 : 0;
  const total = subtotal + homeCharge;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Generate next 14 days
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const handleBook = async () => {
    setBooking(true);
    try {
      const res = await api.post('/bookings', {
        barberId,
        serviceIds: selectedServices.map(s => s._id),
        date: selectedDate,
        timeSlot: { start: selectedSlot.start },
        serviceType,
        homeAddress: serviceType === 'home' ? homeAddress : undefined,
        notes
      });
      toast.success('Booking confirmed! 🎉');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <><Navbar /><div className="page-loader"><div className="loader-spinner" /></div></>;

  return (
    <div className="booking-page">
      <Navbar />
      <div className="container booking-content">
        <div className="booking-header">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="btn btn-ghost"><ChevronLeft size={18} /> Back</button>
          <h1>Book Appointment</h1>
          <div className="booking-steps">
            {['Services', 'Schedule', 'Confirm'].map((s, i) => (
              <div key={i} className={`step-dot ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
                <label>{s}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="booking-grid">
          <div className="booking-main">
            {/* Step 1: Select Services */}
            {step === 1 && (
              <div className="booking-step animate-fadeIn">
                <h2>Select Services</h2>
                <p className="step-desc">Choose one or more services with {barber?.user?.name}</p>
                <div className="booking-services-list">
                  {barber?.services?.map(s => (
                    <div key={s._id} className={`booking-service-item ${selectedServices.find(ss => ss._id === s._id) ? 'selected' : ''}`} onClick={() => toggleService(s)}>
                      <div className="bsi-check">{selectedServices.find(ss => ss._id === s._id) ? <Check size={16} /> : ''}</div>
                      <div className="bsi-info">
                        <h4>{s.name}</h4>
                        <span><Clock size={13} /> {s.duration} min</span>
                      </div>
                      <strong>₹{s.discountPrice || s.price}</strong>
                    </div>
                  ))}
                </div>

                <div className="service-type-toggle">
                  <h3>Service Location</h3>
                  <div className="toggle-wrap">
                    <button className={serviceType === 'salon' ? 'active' : ''} onClick={() => setServiceType('salon')}>
                      <MapPin size={16} /> Salon Visit
                    </button>
                    <button className={serviceType === 'home' ? 'active' : ''} onClick={() => setServiceType('home')} disabled={!barber?.homeServiceAvailable}>
                      <Home size={16} /> Home Service {!barber?.homeServiceAvailable && '(N/A)'}
                    </button>
                  </div>
                  {serviceType === 'home' && (
                    <div className="home-address-form animate-fadeIn">
                      <input type="text" className="input-field" placeholder="Street address" value={homeAddress.street} onChange={e => setHomeAddress({...homeAddress, street: e.target.value})} />
                      <div className="home-row">
                        <input type="text" className="input-field" placeholder="City" value={homeAddress.city} onChange={e => setHomeAddress({...homeAddress, city: e.target.value})} />
                        <input type="text" className="input-field" placeholder="Pincode" value={homeAddress.pincode} onChange={e => setHomeAddress({...homeAddress, pincode: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>

                <button className="btn btn-secondary btn-lg w-full" onClick={() => setStep(2)} disabled={selectedServices.length === 0 || (serviceType === 'home' && (!homeAddress.street || !homeAddress.city || !homeAddress.pincode))}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <div className="booking-step animate-fadeIn">
                <h2>Choose Date & Time</h2>
                <p className="step-desc">Pick a convenient slot</p>

                <div className="date-picker-scroll">
                  {dates.map(d => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <button key={dateStr} className={`date-chip ${isSelected ? 'active' : ''}`} onClick={() => setSelectedDate(dateStr)}>
                        <span className="dc-day">{dayName}</span>
                        <span className="dc-num">{d.getDate()}</span>
                        <span className="dc-month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="time-slots animate-fadeIn">
                    <h3>Available Slots</h3>
                    {slots.length === 0 ? (
                      <p className="no-slots">No slots available for this date</p>
                    ) : (
                      <div className="slots-grid">
                        {slots.map((s, i) => (
                          <button key={i} className={`slot-chip ${!s.isAvailable ? 'disabled' : ''} ${selectedSlot?.start === s.start ? 'active' : ''}`} disabled={!s.isAvailable} onClick={() => setSelectedSlot(s)}>
                            {s.start}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
                  <button className="btn btn-secondary btn-lg" onClick={() => setStep(3)} disabled={!selectedDate || !selectedSlot}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="booking-step animate-fadeIn">
                <h2>Confirm Booking</h2>
                <p className="step-desc">Review your appointment details</p>

                <div className="confirm-card">
                  <div className="confirm-stylist">
                    <div className="cs-avatar">{barber?.user?.name?.charAt(0)}</div>
                    <div>
                      <strong>{barber?.user?.name}</strong>
                      <span><Star size={13} fill="currentColor" style={{ color: 'var(--secondary)' }} /> {barber?.rating}</span>
                    </div>
                  </div>

                  <div className="confirm-details">
                    <div className="cd-row"><Calendar size={16} /> <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div className="cd-row"><Clock size={16} /> <strong>Time:</strong> {selectedSlot?.start} ({totalDuration} min)</div>
                    <div className="cd-row"><MapPin size={16} /> <strong>Location:</strong> {serviceType === 'salon' ? barber?.salon : `Home - ${homeAddress.street}, ${homeAddress.city}`}</div>
                  </div>

                  <div className="confirm-services">
                    <h4>Services</h4>
                    {selectedServices.map(s => (
                      <div key={s._id} className="cs-item"><span>{s.name}</span><span>₹{s.discountPrice || s.price}</span></div>
                    ))}
                  </div>

                  <div className="input-group">
                    <label>Special Notes (optional)</label>
                    <textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests..." />
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
                  <button className="btn btn-secondary btn-lg" onClick={handleBook} disabled={booking}>
                    {booking ? 'Booking...' : 'Confirm Booking'} <Check size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="booking-sidebar">
            <div className="sidebar-summary">
              <h3>Booking Summary</h3>
              <div className="summary-stylist">
                <div className="ss-avatar">{barber?.user?.name?.charAt(0)}</div>
                <div><strong>{barber?.user?.name}</strong><span>{barber?.specializations?.[0]}</span></div>
              </div>
              {selectedServices.length > 0 && (
                <div className="summary-services">
                  {selectedServices.map(s => (
                    <div key={s._id} className="ss-item"><span>{s.name}</span><span>₹{s.discountPrice || s.price}</span></div>
                  ))}
                </div>
              )}
              <div className="summary-totals">
                <div className="st-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {homeCharge > 0 && <div className="st-row"><span>Home service fee</span><span>₹{homeCharge}</span></div>}
                <div className="st-row st-total"><span>Total</span><span>₹{total}</span></div>
              </div>
              <p className="pay-note">💰 Pay after service delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
