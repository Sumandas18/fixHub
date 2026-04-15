'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  Star,
  ShieldCheck,
  LogOut,
  Wrench,
  MessageSquareMore,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  {
    section: 'Overview',
    links: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Management',
    links: [
      { label: 'Admins', href: '/admin/management', icon: ShieldCheck },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Providers', href: '/admin/providers', icon: UserCheck },
    ],
  },
  {
    section: 'Services & Bookings',
    links: [
      { label: 'Services', href: '/admin/services', icon: Wrench },
      { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
      { label: 'Ratings', href: '/admin/ratings', icon: Star },
    ],
  },
  {
    section: 'Contact',
    links: [
      { label: 'Message', href: '/admin/contact', icon: MessageSquareMore },
    ]
  },
  {
    section: 'Settings',
    links: [
      { label: 'Profile', href: '/admin/profile', icon: UserCheck },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const displayName = user?.name || user?.user_name || 'Admin User';
  const displayRole = user?.role === 'admin' ? 'Super Admin' : 'Admin';
  const displayInitial = (displayName[0] || 'A').toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
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
          <div className="sidebar-avatar">{displayInitial}</div>
          <div>
            <p className="sidebar-user-name">{displayName}</p>
            <p className="sidebar-user-role">{displayRole}</p>
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
