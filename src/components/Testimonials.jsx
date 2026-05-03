import { useInView } from '../hooks/useAnimations';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    stars: 5,
    quote: "Transformed our entire deployment pipeline. What used to take hours now happens in minutes with zero downtime. Our cloud costs dropped by 35% in the first month.",
    name: 'Rahul Sharma',
    role: 'CTO, FinStack',
    initials: 'RS',
  },
  {
    stars: 5,
    quote: "The Kubernetes migration was flawless. Our app now handles 10x the traffic with auto-scaling, and we haven't had a single incident in 6 months.",
    name: 'Sarah Mitchell',
    role: 'VP Engineering, CloudSync',
    initials: 'SM',
  },
  {
    stars: 5,
    quote: "Security was our biggest concern. The DevSecOps pipeline they built catches vulnerabilities before they reach production. Absolute game-changer.",
    name: 'Arjun Patel',
    role: 'Founder, SecureAPI',
    initials: 'AP',
  },
];

export default function Testimonials() {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <section className="testimonials section-padding" id="testimonials" ref={ref}>
      <div className="container">
        <div className={`fade-up ${isVisible ? 'visible' : ''}`}>
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">Client Reviews</h2>
          <p className="section-subtitle">
            What teams say after working with me on their infrastructure.
          </p>
        </div>

        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`testimonial-card ${i % 2 === 0 ? 'fade-left' : 'fade-right'} ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${0.2 + i * 0.15}s` }}
            >
              <div className="testimonial-card__stars">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <span key={si} className="testimonial-card__star">★</span>
                ))}
              </div>
              <p className="testimonial-card__quote">"{t.quote}"</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
