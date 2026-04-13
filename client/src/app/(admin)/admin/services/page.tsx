'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Loader2, Wrench, Search, ToggleLeft, ToggleRight,
  Plus, X, Upload, Trash2, ImageOff,
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
  { name: 'Home Appliance Repair',       description: 'Professional repair of washing machines, dishwashers, dryers, ovens and all major home appliances.' },
  { name: 'Electrical Services',         description: 'Safe and reliable electrical installations, wiring, panel upgrades, and fault diagnosis by certified electricians.' },
  { name: 'Plumbing Services',           description: 'Expert plumbing for leaks, pipe fitting, drain cleaning, water heater installation and bathroom fixtures.' },
  { name: 'Home Cleaning Services',      description: 'Deep cleaning, regular housekeeping, carpet cleaning and sanitisation for a spotless and hygienic home.' },
  { name: 'Home Maintenance & Handyman', description: 'General repairs, furniture assembly, door & window fixing and all-round home maintenance tasks.' },
  { name: 'Bike & Car Services',         description: 'Doorstep servicing, oil changes, tyre fitting and diagnostics for bikes and cars.' },
  { name: 'AC & Refrigerator Repair',    description: 'Installation, gas refilling, deep cleaning and repair services for air conditioners and refrigerators.' },
  { name: 'Painting & Renovation',       description: 'Interior and exterior painting, wall texturing, waterproofing and full home renovation solutions.' },
  { name: 'Pest Control Services',       description: 'Safe and effective termite, rodent, cockroach and mosquito control treatments for your home or office.' },
];

/* ────────────────────────────────────────────── */

export default function AdminServicesPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  /* list state */
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  /* modal state */
  const [open, setOpen]         = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* form fields */
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [imgFile, setImgFile]   = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  /* seeding state */
  const [seeding, setSeeding]           = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

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

  /* ── auto-seed 9 default services if DB is empty ── */
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
      } catch {
        // skip already-existing or failed ones silently
      }
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

  /* ── filtered list ── */
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

  /* ── reset modal ── */
  const resetModal = () => {
    setName(''); setDesc(''); setImgFile(null); setImgPreview(null);
    setOpen(false);
  };

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) { toast.error('Name and description are required'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('service_name', name.trim());
      fd.append('service_description', desc.trim());
      if (imgFile) fd.append('service-img', imgFile);   // field name the backend expects

      await adminApi.createService(fd);
      toast.success('Service added successfully!');
      resetModal();
      setLoading(true);
      await fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message?.[0] || err.response?.data?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── toggle ── */
  const handleToggle = async (id: string) => {
    try {
      await adminApi.toggleService(id);
      setServices(prev => prev.map(s => s._id === id ? { ...s, is_active: !s.is_active } : s));
    } catch {
      toast.error('Failed to toggle service');
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

        {/* Add button */}
        <motion.button
          whileHover={seeding ? {} : { scale: 1.04 }}
          whileTap={seeding ? {} : { scale: 0.96 }}
          onClick={() => !seeding && setOpen(true)}
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(235,94,40,0.08)', border: '1px solid rgba(235,94,40,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <Loader2 size={16} color="#eb5e28" className="al-spin" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 }}>
                Setting up default services… {seedProgress} / {DEFAULT_SERVICES.length}
              </p>
              {/* progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${(seedProgress / DEFAULT_SERVICES.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg,#eb5e28,#f97316)', borderRadius: 99 }}
                />
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
              Please wait…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search ── */}
      <motion.div variants={fadeUpVariant} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 16px', maxWidth: 360 }}>
          <Search size={15} color="#4a5568" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services…"
            style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }}
          />
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

                  {/* Image cell */}
                  <td>
                    {s.service_image_url ? (
                      <img
                        src={s.service_image_url}
                        alt={s.service_name}
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#eb5e28,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wrench size={16} color="#fff" />
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.service_name || '—'}</span>
                  </td>

                  {/* Description */}
                  <td style={{ color: '#94a3b8', maxWidth: 260 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.service_description || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <button
                      onClick={() => handleToggle(s._id)}
                      title="Toggle status"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                    >
                      {s.is_active !== false
                        ? <><ToggleRight size={18} color="#4ade80" /><span className="badge active">Active</span></>
                        : <><ToggleLeft size={18} color="#f87171" /><span className="badge blocked">Inactive</span></>
                      }
                    </button>
                  </td>

                  {/* Created */}
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="btn btn-danger btn-sm"
                      title="Delete service"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ═══════════════════ ADD SERVICE MODAL ═══════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              variants={scaleUpVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 500,
                background: 'rgba(17,24,39,0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#eb5e28,#d2501e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>Add New Service</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Fill in details to create a service</p>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  style={{ width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Service Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Service Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Plumbing, Electrical…"
                      style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(235,94,40,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Brief description of this service…"
                      style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(235,94,40,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Service Image <span style={{ color: '#4a5568', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleFilePick} />

                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{ border: '2px dashed rgba(235,94,40,0.3)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(235,94,40,0.03)', transition: 'all 0.2s', position: 'relative' }}
                      onMouseOver={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(235,94,40,0.6)'}
                      onMouseOut={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(235,94,40,0.3)'}
                    >
                      <AnimatePresence mode="wait">
                        {imgPreview ? (
                          <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <img src={imgPreview} alt="preview" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(235,94,40,0.4)', boxShadow: '0 0 20px rgba(235,94,40,0.2)' }} />
                            <span style={{ fontSize: 12, color: '#eb5e28', fontWeight: 600 }}>Click to change image</span>
                            <span style={{ fontSize: 11, color: '#4a5568' }}>{imgFile?.name}</span>
                          </motion.div>
                        ) : (
                          <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed rgba(235,94,40,0.4)', background: 'rgba(235,94,40,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Upload size={20} color="#eb5e28" />
                            </div>
                            <p style={{ fontSize: 13, color: '#64748b' }}>Click to <span style={{ color: '#eb5e28', fontWeight: 600 }}>upload image</span></p>
                            <p style={{ fontSize: 11, color: '#334155' }}>JPG · PNG · WebP · max 4 MB</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="btn btn-secondary"
                    style={{ fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ fontFamily: 'inherit', minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? <><Loader2 size={14} className="al-spin" /> Creating…</> : <><Plus size={14} /> Add Service</>}
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
