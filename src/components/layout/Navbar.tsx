"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/Button';
import styles from './Navbar.module.css';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Explore Schemes', href: '/explore' },
    { label: 'Resources', href: '/#resources' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          SCHEMORA
          <span className={styles.brandDot} />
        </Link>
        
        <div className={styles.navLinks}>
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.activeLink : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/assessment" className={styles.desktopOnly}>
            <Button variant="primary" size="sm">Start Assessment</Button>
          </Link>
          <button className={styles.mobileMenuBtn} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
