import { useEffect, useRef } from 'react';
import { useInView } from '../hooks/useAnimations';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  mailtoInquiry,
} from '../constants/contact';
import './CtaBanner.css';

export default function CtaBanner() {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animFrame;

    const resize = () => {
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
      
      particles = Array.from({ length: 50 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 232, 255, 0.45)';
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <section className="cta-banner" id="cta" ref={ref}>
      <canvas ref={canvasRef} className="cta-banner__canvas" />
      <div className={`cta-banner__content container fade-up ${isVisible ? 'visible' : ''}`}>
        <h2 className="cta-banner__title">Ready to scale your infrastructure?</h2>
        <p className="cta-banner__subtitle">
          Share your stack and goals — we typically reply within one business day.
        </p>
        <div className="cta-banner__actions">
          <a href={mailtoInquiry} className="btn btn-primary cta-banner__btn">
            Get in touch
          </a>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="btn btn-ghost cta-banner__btn cta-banner__btn--secondary">
            Call {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
        <p className="cta-banner__contact">
          <a href={mailtoInquiry}>{CONTACT_EMAIL}</a>
          <span className="cta-banner__contact-sep" aria-hidden="true">·</span>
          <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE_DISPLAY}</a>
        </p>
      </div>
    </section>
  );
}
