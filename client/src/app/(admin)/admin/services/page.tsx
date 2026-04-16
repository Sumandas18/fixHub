'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Loader2, Wrench, Search, ToggleLeft, ToggleRight,
  Plus, X, Upload, Trash2, Pencil,
} from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

/* ────────────────────────────────────────────── */

interface Service {
  _id: string;
  service_name: string;
  service_description: string;
  service_image?: string;
  service_image_url?: string;
  is_active?: boolean;
  createdAt?: string;
}

/* ── 9 default services (seeded when DB is empty) ── */
const DEFAULT_SERVICES: { name: string; description: string }[] = [
  { name: 'Home Appliance Repair', description: 'Professional repair of washing machines, dishwashers, dryers, ovens and all major home appliances.' },
  { name: 'Electrical Services', description: 'Safe and reliable electrical installations, wiring, panel upgrades, and fault diagnosis by certified electricians.' },
  { name: 'Plumbing Services', description: 'Expert plumbing for leaks, pipe fitting, drain cleaning, water heater installation and bathroom fixtures.' },
  { name: 'Home Cleaning Services', description: 'Deep cleaning, regular housekeeping, carpet cleaning and sanitisation for a spotless and hygienic home.' },
  { name: 'Home Maintenance & Handyman', description: 'General repairs, furniture assembly, door & window fixing and all-round home maintenance tasks.' },
  { name: 'Bike & Car Services', description: 'Doorstep servicing, oil changes, tyre fitting and diagnostics for bikes and cars.' },
  { name: 'AC & Refrigerator Repair', description: 'Installation, gas refilling, deep cleaning and repair services for air conditioners and refrigerators.' },
  { name: 'Painting & Renovation', description: 'Interior and exterior painting, wall texturing, waterproofing and full home renovation solutions.' },
  { name: 'Pest Control Services', description: 'Safe and effective termite, rodent, cockroach and mosquito control treatments for your home or office.' },
];

/* ────────────────────────────────────────────── */

export default function AdminServicesPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  /* list state */
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  /* add modal state */
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  /* edit modal state */
  const [editService, setEditService] = useState<Service | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  /* seeding state */
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

  /* toggling */
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /* ── fetch ── */
  const fetchServices = async (): Promise<Service[]> => {
    try {
      const res = await adminApi.getServices();
      const data: Service[] = res.data || [];
      setServices(data);
      return data;
    } catch {
      toast.error('Failed to load services');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /* ── auto-seed ── */
  const seedDefaults = async () => {
    setSeeding(true);
    setSeedProgress(0);
    let created = 0;
    for (const svc of DEFAULT_SERVICES) {
      try {
        const fd = new FormData();
        fd.append('service_name', svc.name);
        fd.append('service_description', svc.description);
        await adminApi.createService(fd);
        created++;
        setSeedProgress(created);
      } catch { /* skip */ }
    }
    setSeeding(false);
    toast.success(`${created} default service${created !== 1 ? 's' : ''} created!`);
    setLoading(true);
    await fetchServices();
  };

  useEffect(() => {
    fetchServices().then(data => {
      if (data.length === 0) seedDefaults();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = services.filter(s =>
    (s.service_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.service_description || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ── image pick ── */
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast.error('Image must be under 4 MB'); return; }
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  };

  /* ── reset add modal ── */
  const resetAddModal = () => {
    setName(''); setDesc(''); setImgFile(null); setImgPreview(null);
    setAddOpen(false);
  };

  /* ── add submit ── */
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) { toast.error('Name and description are required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('service_name', name.trim());
      fd.append('service_description', desc.trim());
      if (imgFile) fd.append('service-img', imgFile);
      await adminApi.createService(fd);
      toast.success('Service added successfully!');
      resetAddModal();
      setLoading(true);
      await fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message?.[0] || err.response?.data?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── open edit modal ── */
  const openEdit = (s: Service) => {
    setEditService(s);
    setEditName(s.service_name);
    setEditDesc(s.service_description);
  };

  /* ── edit submit ── */
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    if (!editName.trim() || !editDesc.trim()) { toast.error('Name and description are required'); return; }
    setEditSubmitting(true);
    try {
      await adminApi.updateService(editService._id, {
        service_name: editName.trim(),
        service_description: editDesc.trim(),
      });
      setServices(prev =>
        prev.map(s => s._id === editService._id
          ? { ...s, service_name: editName.trim(), service_description: editDesc.trim() }
          : s
        )
      );
      toast.success('Service updated successfully!');
      setEditService(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update service');
    } finally {
      setEditSubmitting(false);
    }
  };

  /* ── toggle ── */
  const handleToggle = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    try {
      await adminApi.toggleService(id);
      setServices(prev => prev.map(s => s._id === id ? { ...s, is_active: !s.is_active } : s));
      toast.success(`Service ${currentActive ? 'deactivated' : 'activated'} successfully`);
    } catch {
      toast.error('Failed to toggle service');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      await adminApi.deleteService(id);
      toast.success('Service deleted');
      setServices(prev => prev.filter(s => s._id !== id));
    } catch {
      toast.error('Failed to delete service');
    }
  };

  /* ── shared modal field style ── */
  const fieldStyle = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' };

  /* ────────────────────────────── RENDER ────────────────────── */
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">

      {/* ── Page Header ── */}
      <div className="dashboard-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="dashboard-page-title">Services</h1>
          <p className="dashboard-page-subtitle">
            All available services —{' '}
            <strong style={{ color: '#eb5e28' }}>{services.length}</strong> total
            {services.length > 0 && (
              <span style={{ marginLeft: 10, fontSize: 12, color: '#4ade80' }}>
                ● {services.filter(s => s.is_active !== false).length} active
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={seeding ? {} : { scale: 1.04 }}
          whileTap={seeding ? {} : { scale: 0.96 }}
          onClick={() => !seeding && setAddOpen(true)}
          disabled={seeding}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, boxShadow: '0 4px 16px rgba(235,94,40,0.35)', opacity: seeding ? 0.5 : 1, cursor: seeding ? 'not-allowed' : 'pointer' }}
        >
          <Plus size={15} /> Add Service
        </motion.button>
      </div>

      {/* ── Seeding banner ── */}
      <AnimatePresence>
        {seeding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(235,94,40,0.08)', border: '1px solid rgba(235,94,40,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <Loader2 size={16} color="#eb5e28" className="al-spin" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 }}>
                Setting up default services… {seedProgress} / {DEFAULT_SERVICES.length}
              </p>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(seedProgress / DEFAULT_SERVICES.length) * 100}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'linear-gradient(90deg,#eb5e28,#f97316)', borderRadius: 99 }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search ── */}
      <motion.div variants={fadeUpVariant} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 16px', maxWidth: 360 }}>
          <Search size={15} color="#4a5568" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…" style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }} />
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={fadeUpVariant} className="data-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} color="#eb5e28" className="al-spin" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Service Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 48 }}>
                    <Wrench size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No services found
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    {s.service_image_url ? (
                      <img src={s.service_image_url} alt={s.service_name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#eb5e28,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wrench size={16} color="#fff" />
                      </div>
                    )}
                  </td>
                  <td><span style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.service_name || '—'}</span></td>
                  <td style={{ color: '#94a3b8', maxWidth: 260 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.service_description || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.is_active !== false ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: s.is_active !== false ? '#4ade80' : '#f87171', border: `1px solid ${s.is_active !== false ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.is_active !== false ? '#4ade80' : '#f87171' }} />
                        {s.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleToggle(s._id, s.is_active !== false)} disabled={togglingId === s._id} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, cursor: togglingId === s._id ? 'not-allowed' : 'pointer', border: s.is_active !== false ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(74,222,128,0.3)', background: s.is_active !== false ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.08)', color: s.is_active !== false ? '#f87171' : '#4ade80', display: 'inline-flex', alignItems: 'center', gap: 4, opacity: togglingId === s._id ? 0.6 : 1 }}>
                        {togglingId === s._id ? <Loader2 size={11} className="al-spin" /> : s.is_active !== false ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                        {s.is_active !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  {/* ── Actions: Edit + Delete ── */}
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(s)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ═══════════════════ ADD SERVICE MODAL ═══════════════════ */}
      <AnimatePresence>
        {addOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAddModal}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 500, background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#eb5e28,#d2501e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Add New Service</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Fill in details to create a service</p>
                  </div>
                </div>
                <button onClick={resetAddModal} style={{ width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Service Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Plumbing, Electrical…" style={fieldStyle} onFocus={e => e.target.style.borderColor = 'rgba(235,94,40,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Description *</label>
                    <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description…" style={{ ...fieldStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'rgba(235,94,40,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Service Image <span style={{ color: '#4a5568', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleFilePick} />
                    <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(235,94,40,0.3)', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'rgba(235,94,40,0.03)' }}>
                      {imgPreview ? <img src={imgPreview} alt="preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', margin: '0 auto', display: 'block' }} /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <Upload size={20} color="#eb5e28" />
                          <p style={{ fontSize: 12, color: '#64748b' }}>Click to <span style={{ color: '#eb5e28' }}>upload</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={resetAddModal} className="btn btn-secondary" style={{ fontFamily: 'inherit' }}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ fontFamily: 'inherit', minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? <><Loader2 size={14} className="al-spin" /> Creating…</> : <><Plus size={14} /> Add Service</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ EDIT SERVICE MODAL ═══════════════════ */}
      <AnimatePresence>
        {editService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditService(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 500, background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pencil size={16} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Edit Service</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Update service details</p>
                  </div>
                </div>
                <button onClick={() => setEditService(null)} style={{ width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Service Name *</label>
                    <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={fieldStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Description *</label>
                    <textarea required rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ ...fieldStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditService(null)} className="btn btn-secondary" style={{ fontFamily: 'inherit' }}>Cancel</button>
                  <button type="submit" disabled={editSubmitting} className="btn btn-primary" style={{ fontFamily: 'inherit', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: editSubmitting ? 0.7 : 1, background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }}>
                    {editSubmitting ? <><Loader2 size={14} className="al-spin" /> Saving…</> : <><Pencil size={14} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
