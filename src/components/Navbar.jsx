import { useState, useEffect } from 'react';
import { mailtoHire } from '../constants/contact';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#why-me' },
    { label: 'Stack', href: '#tech-stack' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Contact', href: '#cta' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__inner container">
        <a href="#" className="navbar__logo">
          <span className="navbar__logo-icon">⬡</span>
          <span className="navbar__logo-text">DevOps<span className="navbar__logo-x">X</span></span>
        </a>

        <ul className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="navbar__link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href={mailtoHire} className="navbar__cta btn btn-primary">
          Hire Me
        </a>

        <button
          className={`navbar__burger ${mobileOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
