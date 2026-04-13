'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, CalendarDays, User, LogOut, Home, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function UserNavbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, logout } = useAuthStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derived display values from Zustand store
  const displayName  = user?.name  || user?.user_name  || 'User';
  const displayEmail = user?.email || user?.user_email || '';
  const displayInitial = (displayName[0] || 'U').toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/user/dashboard', icon: Home },
    { label: 'My Bookings', href: '/user/bookings',  icon: CalendarDays },
    { label: 'Profile',    href: '/user/profile',    icon: User },
  ];

  return (
    <header className="usr-navbar">
      {/* Logo */}
      <Link href="/user/dashboard" className="usr-navbar-logo">
        <Image src="/logo/FixHublogo.png" alt="FixHub Logo" width={110} height={32} style={{ objectFit: 'contain' }} />
      </Link>

      {/* Search */}
      <div className="usr-search">
        <Search size={15} color="#475569" />
        <input type="text" placeholder="Search for a service..." />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {navLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`usr-nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        {/* Avatar dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            id="usr-avatar-menu"
            className="usr-avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {displayInitial}
            <ChevronDown size={10} style={{ position: 'absolute', bottom: -2, right: -2, background: '#161b27', borderRadius: '50%' }} />
          </button>

          {dropdownOpen && (
            <div className="usr-dropdown">
              <div className="usr-dropdown-user">
                <p className="usr-dropdown-name">{displayName}</p>
                <p className="usr-dropdown-email">{displayEmail}</p>
              </div>
              <Link href="/user/profile" className="usr-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <User size={15} /> My Profile
              </Link>
              <Link href="/user/bookings" className="usr-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <CalendarDays size={15} /> My Bookings
              </Link>
              <button className="usr-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
