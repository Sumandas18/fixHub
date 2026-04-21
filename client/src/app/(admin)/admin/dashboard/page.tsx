'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CalendarDays,
  Star,
  TrendingUp,
  ShieldCheck,
  Clock,
  Loader2,
  CheckCircle,
  X,
  FileText,
  User,
  ExternalLink,
  Settings,
  BarChart3,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const mediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/${path.replace(/^\//, '')}`;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    admins: [] as any[],
    customers: [] as any[],
    providers: [] as any[],
    bookings: [] as any[],
    serviceProviders: [] as any[],
    ratings: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [approvalModal, setApprovalModal] = useState<any>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [admins, customers, providers, serviceProviders, bookings, ratings] =
        await Promise.allSettled([
          adminApi.getAdmins(),
          adminApi.getCustomers(),
          adminApi.getProviders(),
          adminApi.getServiceProviders(),
          adminApi.getBookings(),
          adminApi.getRatings(),
        ]);

      const resolve = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? r.value?.data || [] : [];

      setData({
        admins: resolve(admins),
        customers: resolve(customers),
        providers: resolve(providers),
        serviceProviders: resolve(serviceProviders),
        bookings: resolve(bookings),
        ratings: resolve(ratings),
      });

    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveReject = async (id: string, newStatus: 'approve' | 'reject') => {
    setStatus(newStatus);
    setApprovalLoading(true);
    try {
      await adminApi.approveProvider(id, newStatus);
      toast.success(`Provider ${newStatus === 'approve' ? 'approved' : 'rejected'} successfully!`);
      await fetchDashboardData();
      setApprovalModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${newStatus} provider`);
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" />
        <p className="text-[#94a3b8] font-medium animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const avgRating =
    data.ratings.length > 0
      ? (data.ratings.reduce((s: number, r: any) => s + (r.rating || 0), 0) / data.ratings.length).toFixed(1)
      : '—';

  const stats = [
    { label: 'Total Users', value: data.customers.length.toString(), icon: Users },
    { label: 'Providers', value: data.providers.length.toString(), icon: UserCheck },
    { label: 'Bookings', value: data.bookings.length.toString(), icon: CalendarDays },
    { label: 'Revenue', value: '₹' + (data.bookings.length * 150), icon: BarChart3 }, 
  ];

  const recentActivity = [
    { text: `System initialized with latest data`, time: 'Just now', type: 'system' },
    { text: `${data.bookings.length} Bookings successfully tracked`, time: 'Live', type: 'booking' },
    { text: `${data.customers.length} Customers have registered`, time: 'Live', type: 'user' },
    { text: `${data.admins.length} Admins currently online`, time: 'Live', type: 'admin' },
  ];

  const pendingProviders = data.serviceProviders
    .filter((sp: any) => sp.status === 'pending' && sp.isProfileCompleted)
    .slice(0, 4)
    .map((sp: any) => ({
      ...sp,
      name: sp.provider?.user_name || sp.provider_id?.name || 'Unknown Provider',
      email: sp.provider?.user_email || 'No email',
      doc_url: sp.provider?.doc_url,
      service: sp.service?.service_name || 'Unknown Service',
      date: new Date(sp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id: sp.provider_id,
    }));

  return (
    <div className="relative min-h-[100vh] bg-transparent text-white overflow-hidden pb-12">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#FF6B00] blur-[150px] opacity-20 pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4338CA] blur-[180px] opacity-20 pointer-events-none rounded-full" />
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#FF6B00] blur-[120px] opacity-10 pointer-events-none rounded-full" />

      {/* HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full rounded-3xl p-8 mb-10 overflow-hidden flex flex-col md:flex-row items-center justify-between border border-white/5 bg-white/5 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(11,15,26,0.5) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <div className="relative z-20 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Welcome to <span className="text-[#FF6B00]">FixHub</span>
          </h1>
          <p className="text-lg text-[#94a3b8] mb-8 leading-relaxed">
            Monitor activity, manage service providers, and control your growing platform effortlessly.
          </p>
          <div className="flex gap-4">
            <Link href="/admin/providers">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#FF6B00] hover:bg-[#e05a00] text-white font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(255,107,0,0.3)]"
              >
                <CheckCircle size={18} /> Approve Providers
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Right side graphic */}
        <div className="relative z-20 mt-8 md:mt-0 right-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] opacity-80 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00] to-[#FFFFFF] rounded-full blur-[60px] opacity-20" />
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-full border-[10px] border-white/5 rounded-3xl rotate-12 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-2xl"
          >
             <ShieldCheck size={100} className="text-[#FF6B00]" />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Stats + Quick Actions) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl flex flex-col items-center text-center group cursor-pointer"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B00]/0 to-[#FF6B00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-xl flex items-center justify-center mb-4 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-300">
                  <stat.icon size={22} />
                </div>
                <h3 className="text-3xl md:text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</h3>
                <p className="text-xs md:text-sm text-[#94a3b8] font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-[#FF6B00]" size={20}/> Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/providers">
                <motion.div whileHover={{ scale: 1.03 }} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[#FF6B00]/50 transition-colors">
                   <div className="p-3 bg-[#FF6B00]/20 rounded-lg text-[#FF6B00]"><UserCheck size={20} /></div>
                   <div>
                     <p className="font-semibold text-sm">Approve Providers</p>
                     <p className="text-xs text-[#64748b]">Review pending apps</p>
                   </div>
                </motion.div>
              </Link>
              <Link href="/admin/services">
                <motion.div whileHover={{ scale: 1.03 }} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[#FF6B00]/50 transition-colors">
                   <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Settings size={20} /></div>
                   <div>
                     <p className="font-semibold text-sm">Manage Services</p>
                     <p className="text-xs text-[#64748b]">Edit platform services</p>
                   </div>
                </motion.div>
              </Link>
              <Link href="/admin/bookings">
                <motion.div whileHover={{ scale: 1.03 }} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[#FF6B00]/50 transition-colors">
                   <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><FileText size={20} /></div>
                   <div>
                     <p className="font-semibold text-sm">View Reports</p>
                     <p className="text-xs text-[#64748b]">Review system stats</p>
                   </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        
        </div>

        {/* Right Column (Activity & Approvals) */}
        <div className="space-y-8">
          
          {/* Pending Approvals */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 blur-[50px]" />
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><ShieldCheck className="text-[#FF6B00]" size={20}/> Approvals</span>
              {pendingProviders.length > 0 && <span className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs px-2 py-1 rounded-md">{pendingProviders.length} New</span>}
            </h2>

            <div className="space-y-4 relative z-10">
              {pendingProviders.length === 0 ? (
                <p className="text-[#64748b] text-sm text-center py-6">No pending providers.</p>
              ) : pendingProviders.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:bg-black/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-800 flex items-center justify-center font-bold text-white">
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white line-clamp-1">{p.name}</p>
                      <p className="text-xs text-[#64748b]">{p.service}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setApprovalModal(p)}
                    className="w-8 h-8 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center hover:bg-[#FF6B00] hover:text-white transition-colors"
                  >
                    <Check size={16} />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock className="text-[#FF6B00]" size={20}/> Global Activity</h2>
            <div className="space-y-5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative mt-1">
                    <div className={`w-3 h-3 rounded-full ${item.type === 'system' ? 'bg-[#FF6B00]' : item.type === 'booking' ? 'bg-blue-500' : 'bg-green-500'} shadow-[0_0_10px_currentColor]`} />
                    {i !== recentActivity.length - 1 && <div className="absolute top-3 left-1.5 w-[1px] h-8 bg-white/10" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{item.text}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* APPROVAL MODAL */}
      <AnimatePresence>
        {approvalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setApprovalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white">Review Application</h2>
                  <p className="text-xs text-[#94a3b8] mt-1">Approve or reject this provider.</p>
                </div>
                <button onClick={() => setApprovalModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#94a3b8]">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-4">
                  {approvalModal.profile_img_url ? (
                    <img src={mediaUrl(approvalModal.profile_img_url) ?? ''} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6B00]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-800 flex items-center justify-center text-2xl text-white font-bold">
                      {approvalModal.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{approvalModal.name}</h3>
                    <p className="text-sm text-[#94a3b8] flex items-center gap-1"><User size={14} /> {approvalModal.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase text-[#64748b] font-bold mb-1">Service</p>
                    <p className="text-sm font-medium text-white">{approvalModal.service}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#64748b] font-bold mb-1">Experience</p>
                    <p className="text-sm font-medium text-white">{approvalModal.experience} yrs.</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#64748b] font-bold mb-1">Rate</p>
                    <p className="text-sm font-medium text-white">₹{approvalModal.charges_per_hour}/hr</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#64748b] font-bold mb-1">Service Area</p>
                    <p className="text-sm font-medium text-white">{approvalModal.service_area_zip?.[0] || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-white">Legal ID Document</p>
                  {(() => {
                    const url = mediaUrl(approvalModal.doc_url);
                    if (!url) return <p className="text-sm text-red-400">No document uploaded</p>;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    return isImage ? (
                      <div className="rounded-xl overflow-hidden border border-white/10 group relative">
                        <img src={url} alt="ID" className="w-full h-48 object-cover" />
                        <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-semibold flex flex-col gap-2">
                          <ExternalLink size={24} /> Open Full
                        </a>
                      </div>
                    ) : (
                      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl text-blue-400 text-sm hover:bg-white/10 transition">
                        <FileText size={18} /> View Document
                      </a>
                    );
                  })()}
                </div>
              </div>

              <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3 justify-end">
                <button 
                  onClick={() => handleApproveReject(approvalModal.id, 'reject')} 
                  disabled={approvalLoading} 
                  className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold transition"
                >
                  {(approvalLoading && status == 'reject') ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reject'}
                </button>
                <button 
                  onClick={() => handleApproveReject(approvalModal.id, 'approve')} 
                  disabled={approvalLoading} 
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05a00] text-white font-semibold flex items-center gap-2 transition shadow-[0_4px_20px_rgba(255,107,0,0.4)]"
                >
                  {(approvalLoading && status == 'approve') ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check size={18} /> Approve</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
