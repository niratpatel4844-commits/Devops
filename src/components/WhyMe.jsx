import { useInView, useCountUp } from '../hooks/useAnimations';
import './WhyMe.css';

const STATS = [
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 99.9, suffix: '%', label: 'Avg Uptime', isDecimal: true },
  { value: 40, suffix: '%', label: 'Avg Cost Saved' },
  { value: 5, suffix: '+', label: 'Years Experience' },
];

const VALUE_PROPS = [
  {
    icon: '⚡',
    title: 'Ship Faster',
    description: 'Automated pipelines cut deployment time from hours to minutes.',
  },
  {
    icon: '💰',
    title: 'Cut Costs',
    description: 'Right-sizing, spot instances, and smart scaling save 30–50% on cloud bills.',
  },
  {
    icon: '🛡️',
    title: 'Stay Secure',
    description: 'Security-first approach with automated scanning and compliance checks.',
  },
];

const PROCESS_STEPS = [
  { step: '01', label: 'Audit', description: 'Deep dive into your current infrastructure' },
  { step: '02', label: 'Architect', description: 'Design the optimal cloud architecture' },
  { step: '03', label: 'Build', description: 'Implement with IaC and CI/CD automation' },
  { step: '04', label: 'Handoff', description: 'Full documentation and knowledge transfer' },
];

function StatCard({ value, suffix, label, isDecimal, isActive }) {
  const count = useCountUp(isDecimal ? 999 : value, 2000, isActive);
  const displayValue = isDecimal ? '99.9' : count;

  return (
    <div className="stat-card">
      <div className="stat-card__value">
        {isDecimal && isActive ? displayValue : isDecimal ? '0' : count}
        <span className="stat-card__suffix">{suffix}</span>
      </div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export default function WhyMe() {
  const [ref, isVisible] = useInView({ threshold: 0.15 });
  const [processRef, processVisible] = useInView({ threshold: 0.1 });

  return (
    <section className="why-me section-padding" id="why-me">
      <div className="container">
        <div className={`fade-up ${isVisible ? 'visible' : ''}`} ref={ref}>
          <div className="section-label">Why Me</div>
          <h2 className="section-title">Metrics That Matter</h2>
          <p className="section-subtitle">
            Real results from real infrastructure — measured, monitored, and optimized.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="why-me__stats">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} isActive={isVisible} />
          ))}
        </div>

        {/* Value Props */}
        <div className="why-me__props">
          {VALUE_PROPS.map((prop, i) => (
            <div
              key={prop.title}
              className={`why-me__prop-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${0.3 + i * 0.15}s` }}
            >
              <span className="why-me__prop-icon">{prop.icon}</span>
              <h3 className="why-me__prop-title">{prop.title}</h3>
              <p className="why-me__prop-desc">{prop.description}</p>
            </div>
          ))}
        </div>

        {/* Process Timeline */}
        <div
          className={`why-me__process fade-up ${processVisible ? 'visible' : ''}`}
          ref={processRef}
        >
          <h3 className="why-me__process-title">How I Work</h3>
          <div className="why-me__timeline">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="why-me__timeline-step"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="why-me__timeline-number">{step.step}</div>
                <div className="why-me__timeline-line"></div>
                <div className="why-me__timeline-content">
                  <h4 className="why-me__timeline-label">{step.label}</h4>
                  <p className="why-me__timeline-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
