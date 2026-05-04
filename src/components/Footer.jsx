import {
  CONTACT_EMAIL,
  CONTACT_PHONE_PRETTY,
  CONTACT_PHONE_TEL,
} from '../constants/contact';
import './Footer.css';

function IconMail({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <a href="#" className="navbar__logo footer__logo">
              <span className="navbar__logo-icon">⬡</span>
              <span className="navbar__logo-text">
                DevOps<span className="navbar__logo-x">X</span>
              </span>
            </a>
            <p className="footer__desc">
              DevOpsX is an IT practice that specializes in cloud infrastructure, CI/CD automation, and
              reliable systems at scale.
            </p>
            <div className="footer__divider" role="presentation" />
            <div className="footer__contact-block">
              <div className="footer__contact-item">
                <div className="footer__contact-label">Mail Me:</div>
                <div className="footer__contact-line">
                  <IconMail className="footer__contact-icon" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="footer__contact-value">
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="footer__contact-item">
                <div className="footer__contact-label">Call Me Anytime:</div>
                <div className="footer__contact-line">
                  <IconPhone className="footer__contact-icon" />
                  <a href={`tel:${CONTACT_PHONE_TEL}`} className="footer__contact-value">
                    {CONTACT_PHONE_PRETTY}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__heading">Navigation</h4>
            <ul className="footer__links">
              <li><a href="#services">Services</a></li>
              <li><a href="#why-me">About</a></li>
              <li><a href="#tech-stack">Stack</a></li>
              <li><a href="#testimonials">Reviews</a></li>
              <li><a href="#cta">Contact</a></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__heading">Connect</h4>
            <ul className="footer__links footer__socials">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} DevOpsX · Built in Ahmedabad, India</p>
        </div>
      </div>
    </footer>
  );
}
