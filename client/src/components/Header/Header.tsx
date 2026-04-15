'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 200,
          padding: scrolled ? '10px 5%' : '14px 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(11,15,25,0.85)' : 'rgba(11,15,25,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          transition: 'padding 0.3s ease, background 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo/FixHublogo.png" alt="FixHub" width={38} height={38} style={{ borderRadius: '50%' }} priority />
          <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            Fix<span style={{ background: 'linear-gradient(90deg,#a855f7,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="nav-desktop">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                position: 'relative',
                padding: '7px 14px',
                fontSize: 14,
                fontWeight: 500,
                color: '#cbd5e1',
                borderRadius: 8,
                transition: 'color 0.2s',
              }}
              className="nav-link-hover"
            >
              {l.label}
            </Link>
          ))}

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/user/dashboard" style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', padding: '7px 14px' }}>Dashboard</Link>
              <button onClick={handleLogout} className="nav-btn-outline">Sign Out</button>
            </div>
          ) : (
            <Link href="/login" className="nav-cta">Login / Register</Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-mobile-toggle"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0,
              zIndex: 199,
              background: 'rgba(11,15,25,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '20px 5%',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 16px', fontSize: 15, fontWeight: 500, color: '#cbd5e1', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop: 8 }}>
              {user ? (
                <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'linear-gradient(135deg,#a855f7,#3b82f6)', borderRadius: 10, color: '#fff', fontWeight: 700 }}>Login / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-link-hover:hover { color: #f1f5f9 !important; background: rgba(255,255,255,0.05) !important; }
        .nav-cta {
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 60%, #ec4899 100%);
          border-radius: 50px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(168,85,247,0.3);
        }
        .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(168,85,247,0.45); }
        .nav-btn-outline {
          padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
          color: #94a3b8; background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; transition: all 0.2s;
        }
        .nav-btn-outline:hover { color: #f1f5f9; border-color: rgba(255,255,255,0.25); }
        .nav-mobile-toggle { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
