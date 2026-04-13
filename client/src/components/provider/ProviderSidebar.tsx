'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Star,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  {
    section: 'Overview',
    links: [
      { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Work',
    links: [
      { label: 'Bookings',  href: '/provider/bookings',  icon: CalendarDays },
      { label: 'Services',  href: '/provider/services',  icon: Wrench },
      { label: 'Reviews',   href: '/provider/reviews',   icon: Star },
    ],
  },
  {
    section: 'Settings',
    links: [
      { label: 'Profile',   href: '/provider/profile',   icon: Briefcase },
    ],
  },
];

export default function ProviderSidebar() {
  const pathname = usePathname();
  const [available, setAvailable] = useState(true);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    window.location.href = '/provider/login';
  };

  return (
    <aside className="pv-sidebar">
      {/* Logo */}
      <div className="pv-logo">
        <Image src="/logo/FixHublogo.png" alt="FixHub Logo" width={110} height={32} style={{ objectFit: 'contain' }} />
        <span className="pv-logo-badge">Provider</span>
      </div>

      {/* Availability toggle */}
      <div className="pv-avail-pill">
        <div>
          <p className="pv-avail-label">Availability</p>
          <span className={`pv-avail-status ${available ? 'online' : 'offline'}`}>
            {available ? '● Online' : '○ Offline'}
          </span>
        </div>
        <label className="pv-toggle">
          <input
            type="checkbox"
            checked={available}
            onChange={() => setAvailable(!available)}
          />
          <span className="pv-slider" />
        </label>
      </div>

      {/* Navigation */}
      <nav className="pv-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="pv-nav-label">{section.section}</p>
            {section.links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`pv-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="pv-sidebar-footer">
        <div className="pv-user-card">
          <div className="pv-avatar">P</div>
          <div>
            <p className="pv-user-name">Kiran Singh</p>
            <p className="pv-user-role">Senior Electrician</p>
          </div>
        </div>
        <button className="pv-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
