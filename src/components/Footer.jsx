import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <a href="#" className="navbar__logo">
              <span className="navbar__logo-icon">⬡</span>
              <span className="navbar__logo-text">DevOps<span className="navbar__logo-x">X</span></span>
            </a>
            <p className="footer__desc">
              Building and automating cloud systems that run at scale — 24/7, across every region.
            </p>
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
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
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
