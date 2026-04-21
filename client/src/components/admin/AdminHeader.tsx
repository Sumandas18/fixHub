'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';

export default function AdminHeader() {
  const { user } = useAuthStore();
  const displayName  = user?.name || (user as any)?.user_name || 'Admin User';
  const displayEmail = user?.email || (user as any)?.user_email || 'admin@fixhub.com';
  const displayInitial = (displayName[0] || 'A').toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-16 w-full flex items-center justify-between px-6 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
      
      {/* Left Area - Mobile Logo (Visible on smaller screens, or integrated in header) */}
      <div className="flex items-center gap-4">
        {/* Mobile menu could go here */}
        <div className="md:hidden flex items-center">
            <Image src="/logo/FixHublogo.png" alt="FixHub Logo" width={90} height={26} style={{ objectFit: 'contain' }} />
        </div>

        {/* Global Search Bar (Glassmorphism look) */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:ring-1 focus-within:ring-[#FF6B00]/50 transition-all">
          <Search size={16} className="text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-[#64748b]"
          />
        </div>
      </div>

      {/* Right Area - Admin Profile & Notifications */}
      <div className="flex items-center gap-5">
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full text-[#94a3b8] bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B00] rounded-full border border-[#0B0F1A]"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full py-1 pr-4 pl-1 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B00] to-orange-800 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {displayInitial}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
            <p className="text-[10px] text-[#64748b] truncate max-w-[120px]">{displayEmail}</p>
          </div>
        </div>
        
      </div>
    </header>
  );
}
