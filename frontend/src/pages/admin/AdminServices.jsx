import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../utils/api';
import { Plus, Edit2, Trash2, Scissors, Clock, DollarSign, Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'haircut',
    price: '',
    duration: '',
    description: '',
    gender: 'unisex',
    isPopular: false
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.services);
    } catch (err) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, formData);
        toast.success('Service updated successfully');
      } else {
        await api.post('/admin/services', formData);
        toast.success('Service added successfully');
      }
      setShowModal(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminSidebar>
      <div className="admin-page-header">
        <div>
          <h1>Services & Hairstyles</h1>
          <p>Manage your menu and pricing</p>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={() => { setEditingService(null); setFormData({ name: '', category: 'haircut', price: '', duration: '', description: '', gender: 'unisex', isPopular: false }); setShowModal(true); }}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search services or hairstyles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="loader-spinner" /></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Gender</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Popular</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div className="table-service-info">
                        <strong>{s.name}</strong>
                        <span>{s.description?.substring(0, 50)}...</span>
                      </div>
                    </td>
                    <td><span className="badge badge-outline">{s.category}</span></td>
                    <td>{s.gender}</td>
                    <td><div className="flex-center gap-1"><Clock size={14} /> {s.duration} min</div></td>
                    <td><strong>₹{s.price}</strong></td>
                    <td>
                      {s.isPopular ? <CheckCircle className="text-success" size={18} /> : <XCircle className="text-muted" size={18} />}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => { setEditingService(s); setFormData({ ...s }); setShowModal(true); }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => deleteService(s._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal scaleIn">
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Modern Faux Hawk" required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="haircut">Haircut / Hairstyle</option>
                    <option value="beard">Beard & Shave</option>
                    <option value="spa">Spa & Massage</option>
                    <option value="facial">Facial & Cleanup</option>
                    <option value="makeup">Makeup</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="499" required />
                </div>
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="45" required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the service..." rows={3} />
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} />
                  Mark as Popular Service
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">{editingService ? 'Save Changes' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
