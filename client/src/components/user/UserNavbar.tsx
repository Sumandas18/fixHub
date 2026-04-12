'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Briefcase, CalendarDays, User, LogOut, Home, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function UserNavbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    Cookies.remove('token');
    Cookies.remove('role');
    window.location.href = '/login';
  };

  const navLinks = [
    { label: 'Browse',   href: '/user/dashboard', icon: Home },
    { label: 'Bookings', href: '/user/bookings',  icon: CalendarDays },
    { label: 'Profile',  href: '/user/profile',   icon: User },
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
            R
            <ChevronDown size={10} style={{ position: 'absolute', bottom: -2, right: -2, background: '#161b27', borderRadius: '50%' }} />
          </button>

          {dropdownOpen && (
            <div className="usr-dropdown">
              <div className="usr-dropdown-user">
                <p className="usr-dropdown-name">Rahul Sharma</p>
                <p className="usr-dropdown-email">rahul@example.com</p>
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
