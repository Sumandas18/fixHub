import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top CTA / Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h3 className={styles.newsletterTitle}>Ready to get started?</h3>
          <p className={styles.newsletterDesc}>Subscribe to our newsletter for exclusive offers and home maintenance tips.</p>
        </div>
        <form className={styles.newsletterForm}>
          <input type="email" placeholder="Enter your email" className={styles.input} required />
          <button type="submit" className={styles.subscribeBtn}>Subscribe</button>
        </form>
      </div>

      <div className={styles.mainContent}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/">
            <Image 
              src="/logo/FixHublogo.png" 
              alt="FixHub Logo" 
              width={55} 
              height={55} 
              className={styles.logo}
            />
          </Link>
          <p className={styles.brandDesc}>
            Your premium on-demand service app for home appliances, electrical fixes, plumbing, and vehicle assistance. Professional repairs, fast.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">FB</a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">TW</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">IG</a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">IN</a>
          </div>
        </div>

        {/* Links Grid */}
        <div className={styles.linksGrid}>
          {/* Company Links */}
          <div className={styles.linksGroup}>
            <h4 className={styles.title}>Company</h4>
            <Link href="#" className={styles.link}>About Us</Link>
            <Link href="#" className={styles.link}>Careers</Link>
            <Link href="#" className={styles.link}>Blog</Link>
            <Link href="#" className={styles.link}>Contact</Link>
          </div>

          {/* Services Links */}
          <div className={styles.linksGroup}>
            <h4 className={styles.title}>Top Services</h4>
            <Link href="#" className={styles.link}>Appliance Repair</Link>
            <Link href="#" className={styles.link}>Electrical Fixes</Link>
            <Link href="#" className={styles.link}>Plumbing</Link>
            <Link href="#" className={styles.link}>Home Maintenance</Link>
          </div>

          {/* Contact Info */}
          <div className={styles.linksGroup}>
            <h4 className={styles.title}>Contact</h4>
            <span className={styles.contactText}>📞 +1 (800) 123-4567</span>
            <span className={styles.contactText}>✉️ support@fixhub.com</span>
            <span className={styles.contactText}>📍 123 Fixer Street, NY 10001</span>
            <span className={styles.contactText}>🕒 Mon-Sat: 8am - 8pm</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} FixHub. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="#" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="#" className={styles.legalLink}>Terms of Service</Link>
            <Link href="#" className={styles.legalLink}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
