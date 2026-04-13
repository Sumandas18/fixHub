'use client';

import { useEffect, useState } from 'react';
import { Plus, Wrench, X, Edit2, Trash2, ToggleLeft, ToggleRight, IndianRupee, Loader2 } from 'lucide-react';
import { providerApi } from '@/services/api/provider';
import toast from 'react-hot-toast';

export default function ProviderServicesPage() {
  const [services, setServices]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', category: '', rate: '', unit: 'per visit', experience: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await providerApi.getServices();
        // Normalize — backend may return { data: [] } or bare array
        const raw = res?.data ?? res ?? [];
        setServices(Array.isArray(raw) ? raw : []);
      } catch (err) {
        toast.error('Failed to load services');
        setServices([]); // always fall back to empty array, never undefined
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', category: '', rate: '', unit: 'per visit', experience: '' });
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditTarget(s);
    setForm({ 
      name: s.service_id?.service_name || '', 
      category: 'General', 
      rate: String(s.charges_per_hour), 
      unit: 'per hour', 
      experience: s.experience 
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.rate) return;
    toast.success('Service functionality mocked in UI (API sync required)');
    setShowModal(false);
  };

  const toggleAvailability = (id: string) => {
    toast.success('Toggle functionality mocked in UI (API sync required)');
  };

  const deleteService = (id: string) => {
    toast.success('Delete functionality mocked in UI (API sync required)');
  };

  return (
    <>
      {/* Header */}
      <div className="pv-page-header">
        <div>
          <h1 className="pv-page-title">My Services</h1>
          <p className="pv-page-subtitle">Manage the services you offer, your rates, and availability.</p>
        </div>
        <button className="pv-btn pv-btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      {/* Info strip */}
      <div
        style={{
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.18)',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: '#94a3b8',
        }}
      >
        <Wrench size={15} color="#60a5fa" />
        You have <strong style={{ color: '#f1f5f9', margin: '0 4px' }}>{services.length}</strong> services registered.
        <strong style={{ color: '#4ade80', margin: '0 4px' }}>{services.filter((s) => s.isAvailable).length}</strong> active,
        <strong style={{ color: '#f87171', margin: '0 4px' }}>{services.filter((s) => !s.isAvailable).length}</strong> paused.
      </div>

      {/* Service Cards Grid */}
      <div className="pv-card" style={{ overflow: 'visible' }}>
        <div className="pv-card-header">
          <h2 className="pv-card-title">Service Provider Details</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40}}>
             <Loader2 className="pv-spin" size={24} color="#1c4ed8" />
          </div>
        ) : services.length === 0 ? (
          <div className="pv-empty">
            <div className="pv-empty-icon">🔧</div>
            <p className="pv-empty-text">No services added yet. Click "Add Service" to get started.</p>
          </div>
        ) : (
          <div className="pv-services-grid">
            {services.map((s) => (
              <div key={s._id} className="pv-service-card" style={{ opacity: s.isAvailable ? 1 : 0.6 }}>
                <div className="pv-service-card-top">
                  <div className="pv-service-icon"><Wrench size={18} /></div>
                  <span className={`pv-badge ${s.isAvailable ? 'in-progress' : 'cancelled'}`} style={{ fontSize: 11 }}>
                    {s.isAvailable ? 'Active' : 'Paused'}
                  </span>
                </div>

                <p className="pv-service-name">{s.service_id?.service_name || 'Unknown Service'}</p>
                <p className="pv-service-category">General · {s.experience} exp</p>

                <p className="pv-service-rate">
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>₹</span>
                  {Number(s.charges_per_hour || 0).toLocaleString('en-IN')}
                </p>
                <p className="pv-service-rate-label">per hour</p>

                <div className="pv-service-card-actions">
                  <button className="pv-btn pv-btn-ghost pv-btn-sm" style={{ flex: 1 }} onClick={() => openEdit(s)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className={`pv-btn pv-btn-sm ${s.isAvailable ? 'pv-btn-danger' : 'pv-btn-success'}`}
                    style={{ flex: 1 }}
                    onClick={() => toggleAvailability(s._id)}
                  >
                    {s.isAvailable ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                    {s.isAvailable ? 'Pause' : 'Resume'}
                  </button>
                  <button className="pv-btn pv-btn-danger pv-btn-sm" onClick={() => deleteService(s._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="pv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pv-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="pv-modal-header">
              <h3 className="pv-modal-title">{editTarget ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="pv-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <div className="pv-modal-body">
              <div className="pv-field">
                <label className="pv-label">Service Name</label>
                <input
                  className="pv-input"
                  placeholder="e.g. Home Wiring Repair"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!!editTarget} // In current DB structure, standard services are pre-defined by admin
                />
              </div>

              <div className="pv-field">
                <label className="pv-label">Category</label>
                <input
                  className="pv-input"
                  placeholder="e.g. Electrician, Plumber..."
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="pv-field">
                  <label className="pv-label">Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      className="pv-input"
                      placeholder="800"
                      style={{ paddingLeft: 32 }}
                      type="number"
                      min="0"
                      value={form.rate}
                      onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pv-field">
                  <label className="pv-label">Billing Unit</label>
                  <select
                    className="pv-select pv-input"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="per visit">Per Visit</option>
                    <option value="per hour">Per Hour</option>
                    <option value="per job">Per Job</option>
                    <option value="per day">Per Day</option>
                    <option value="per unit">Per Unit</option>
                  </select>
                </div>
              </div>

              <div className="pv-field">
                <label className="pv-label">Years of Experience</label>
                <input
                  className="pv-input"
                  placeholder="e.g. 5 years"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
            </div>

            <div className="pv-modal-footer">
              <button className="pv-btn pv-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="pv-btn pv-btn-primary" onClick={handleSave}>
                {editTarget ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
