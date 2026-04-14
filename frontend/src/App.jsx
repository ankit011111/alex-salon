import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Services from './pages/Services';
import BarberList from './pages/BarberList';
import BarberProfile from './pages/BarberProfile';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import BarberDashboard from './pages/barber/BarberDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBarbers from './pages/admin/AdminBarbers';
import AdminServices from './pages/admin/AdminServices';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader-spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/'} /> : <Login />} />
      <Route path="/services" element={<Services />} />
      <Route path="/barbers" element={<BarberList />} />
      <Route path="/barbers/:id" element={<BarberProfile />} />
      
      {/* Customer Routes */}
      <Route path="/book/:barberId" element={<ProtectedRoute roles={['customer']}><BookingPage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />
      
      {/* Barber Routes */}
      <Route path="/barber/*" element={<ProtectedRoute roles={['barber']}><BarberDashboard /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/barbers" element={<ProtectedRoute roles={['admin']}><AdminBarbers /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute roles={['admin']}><AdminServices /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3000,
            style: { background: '#1a1f2c', color: '#fff', fontFamily: 'Manrope, sans-serif' }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
