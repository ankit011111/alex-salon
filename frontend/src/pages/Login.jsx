import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const { login, register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('auth'); // 'auth' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [createdUserId, setCreatedUserId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate(data.user.role === 'admin' ? '/admin' : data.user.role === 'barber' ? '/barber' : '/');
      } else {
        if (!form.name || !form.phone) {
          toast.error('Please fill all fields');
          setLoading(false);
          return;
        }
        const data = await register(form);
        setCreatedUserId(data.userId);
        setStep('otp');
        toast.success('Registration initiated. Please check your SMS for the OTP.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await verifyOtp(createdUserId, otpCode);
      toast.success('Phone verified! Welcome to Alex Salon.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-gradient" />
        <div className="login-hero-content">
          <Link to="/" className="login-brand">
            <Scissors size={28} strokeWidth={1.5} />
            <span>Alex <em>Salon</em></span>
          </Link>
          <h1>Welcome to the<br/>Art of <em>Grooming</em></h1>
          <p>Experience premium grooming services crafted by master stylists.</p>
          <div className="login-hero-stats">
            <div><strong>5,000+</strong><span>Happy Clients</span></div>
            <div><strong>4.8★</strong><span>Avg Rating</span></div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-container animate-fadeIn">
          {step === 'otp' ? (
            <div className="otp-container">
              <div className="login-header">
                <h2>Verify Phone Number</h2>
                <p className="login-desc">Enter the 6-digit code sent to your phone</p>
              </div>
              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="input-group">
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="input-field" placeholder="123456" required style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }} />
                </div>
                <button type="submit" className="btn btn-secondary btn-lg w-full login-submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="login-tabs">
                <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Sign In</button>
                <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button>
              </div>

              <div className="login-header">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="login-desc">{isLogin ? 'Sign in to manage your bookings and dashboard.' : 'Sign up to book premium grooming services.'}</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                  <>
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
                    </div>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 9999999999" required />
                    </div>
                  </>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@example.com" required />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrap">
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Enter password" required minLength={6} />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="login-options">
                    <label className="remember-me"><input type="checkbox" /> Remember me</label>
                    <a href="#" className="forgot-link">Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="btn btn-secondary btn-lg w-full login-submit" disabled={loading}>
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
