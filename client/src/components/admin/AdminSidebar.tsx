'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  CalendarDays,
  Star,
  ShieldCheck,
  LogOut,
  Wrench,
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    links: [
      { label: 'Dashboard',  href: '/admin/dashboard',  icon: LayoutDashboard },
    ],
  },
  {
    section: 'Management',
    links: [
      { label: 'Admins',     href: '/admin/management', icon: ShieldCheck },
      { label: 'Customers',  href: '/admin/customers',  icon: Users },
      { label: 'Providers',  href: '/admin/providers',  icon: UserCheck },
    ],
  },
  {
    section: 'Services & Bookings',
    links: [
      { label: 'Services',   href: '/admin/services',   icon: Wrench },
      { label: 'Bookings',   href: '/admin/bookings',   icon: CalendarDays },
      { label: 'Ratings',    href: '/admin/ratings',    icon: Star },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    // Clear cookies via document.cookie (js-cookie)
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    // Zustand store reset will be wired via useAuthStore in the full integration step
    window.location.href = '/admin/login';
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Image src="/logo/FixHublogo.png" alt="FixHub Logo" width={110} height={32} style={{ objectFit: 'contain' }} />
        <span className="sidebar-logo-badge">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="sidebar-section-label">{section.section}</p>
            {section.links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar-link-icon" size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">A</div>
          <div>
            <p className="sidebar-user-name">Admin User</p>
            <p className="sidebar-user-role">Super Admin</p>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
