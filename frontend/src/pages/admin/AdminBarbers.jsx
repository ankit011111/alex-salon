import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../utils/api';
import { Star, DollarSign, Calendar, Users, TrendingUp, Plus, Edit2, Trash2, Shield, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'barber123',
    specializations: '',
    experience: 0,
    bio: '',
    salon: 'Alex Salon - Main Branch'
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const res = await api.get('/admin/barbers');
      setBarbers(res.data.barbers);
    } catch (err) {
      toast.error('Failed to fetch barbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, specializations: typeof formData.specializations === 'string' ? formData.specializations.split(',').map(s => s.trim()) : formData.specializations };
      if (editingBarber) {
        await api.put(`/admin/barbers/${editingBarber._id}`, payload);
        toast.success('Stylist updated successfully');
      } else {
        await api.post('/admin/barbers', payload);
        toast.success('Stylist added successfully');
      }
      setShowModal(false);
      setEditingBarber(null);
      fetchBarbers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteBarber = async (id) => {
    if (!window.confirm('Deactivating this stylist will prevent them from logging in. Continue?')) return;
    try {
      await api.delete(`/admin/barbers/${id}`);
      toast.success('Stylist deactivated');
      fetchBarbers();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) return <AdminSidebar><div className="page-loader"><div className="loader-spinner" /></div></AdminSidebar>;

  return (
    <AdminSidebar>
      <div className="admin-page-header">
        <div>
          <h1>Stylist Management</h1>
          <p>Track performance and manage your team</p>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={() => { setEditingBarber(null); setFormData({ name: '', email: '', phone: '', password: 'barber123', specializations: '', experience: 0, bio: '', salon: 'Alex Salon - Main Branch' }); setShowModal(true); }}>
          <Plus size={18} /> Add New Stylist
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-grid">
          {barbers.map(b => (
            <div key={b._id} className="admin-card barber-mgmt-card animate-fadeIn">
              <div className="bmc-header">
                <div className="bmc-avatar">{b.user?.name?.charAt(0)}</div>
                <div className="bmc-title">
                  <h4>{b.user?.name}</h4>
                  <span className="bmc-spec">{b.specializations?.join(' • ')}</span>
                </div>
                <div className="bmc-actions">
                  <button className="action-btn edit" onClick={() => { setEditingBarber(b); setFormData({ ...b, name: b.user?.name, email: b.user?.email, phone: b.user?.phone, specializations: b.specializations?.join(', ') }); setShowModal(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => deleteBarber(b._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bmc-stats-grid">
                <div className="bmc-stat">
                  <Star size={14} className="star-icon" />
                  <span><strong>{b.rating || 0}</strong> Rating</span>
                </div>
                <div className="bmc-stat">
                  <Calendar size={14} />
                  <span><strong>{b.completedJobs || 0}</strong> Jobs</span>
                </div>
                <div className="bmc-stat">
                  <TrendingUp size={14} />
                  <span><strong>₹{(b.monthlyRevenue || 0).toLocaleString()}</strong> /mo</span>
                </div>
              </div>

              <div className="bmc-footer">
                <div className="bmc-info"><Mail size={14} /> {b.user?.email}</div>
                <div className="bmc-info"><Phone size={14} /> {b.user?.phone}</div>
                <div className="bmc-info"><MapPin size={14} /> {b.salon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal scaleIn">
            <div className="modal-header">
              <h2>{editingBarber ? 'Edit Stylist' : 'Add New Stylist'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required disabled={!!editingBarber} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="9988776655" required />
                </div>
                {!editingBarber && (
                  <div className="form-group">
                    <label>Password</label>
                    <input type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                )}
                <div className="form-group cols-2">
                  <label>Specializations (comma separated)</label>
                  <input type="text" value={formData.specializations} onChange={(e) => setFormData({...formData, specializations: e.target.value})} placeholder="Haircut, Beard Trim, Spa" required />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Salon Branch</label>
                  <input type="text" value={formData.salon} onChange={(e) => setFormData({...formData, salon: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Bio / Background</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Master stylist with..." rows={3} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">{editingBarber ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
