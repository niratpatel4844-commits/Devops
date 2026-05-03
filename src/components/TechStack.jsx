import { useInView } from '../hooks/useAnimations';
import './TechStack.css';

const TECH_CATEGORIES = [
  {
    label: 'Cloud',
    tools: [
      { emoji: '🟠', name: 'AWS' },
      { emoji: '🔵', name: 'Azure' },
      { emoji: '🟡', name: 'GCP' },
      { emoji: '🌊', name: 'DigitalOcean' },
    ],
  },
  {
    label: 'CI/CD',
    tools: [
      { emoji: '🐙', name: 'GitHub Actions' },
      { emoji: '🏗️', name: 'Jenkins' },
      { emoji: '🦊', name: 'GitLab CI' },
      { emoji: '🔄', name: 'ArgoCD' },
    ],
  },
  {
    label: 'Containers',
    tools: [
      { emoji: '🐳', name: 'Docker' },
      { emoji: '☸️', name: 'Kubernetes' },
      { emoji: '⎈', name: 'Helm' },
      { emoji: '📦', name: 'Podman' },
    ],
  },
  {
    label: 'Monitoring',
    tools: [
      { emoji: '🔥', name: 'Prometheus' },
      { emoji: '📊', name: 'Grafana' },
      { emoji: '🐕', name: 'Datadog' },
      { emoji: '📋', name: 'ELK Stack' },
    ],
  },
  {
    label: 'IaC',
    tools: [
      { emoji: '🏗️', name: 'Terraform' },
      { emoji: '📜', name: 'Pulumi' },
      { emoji: '🤖', name: 'Ansible' },
      { emoji: '☁️', name: 'CloudFormation' },
    ],
  },
  {
    label: 'Security',
    tools: [
      { emoji: '🔐', name: 'HashiCorp Vault' },
      { emoji: '🔍', name: 'Trivy' },
      { emoji: '🛡️', name: 'SonarQube' },
      { emoji: '🔒', name: 'OWASP ZAP' },
    ],
  },
];

export default function TechStack() {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <section className="tech-stack section-padding" id="tech-stack" ref={ref}>
      {/* Circuit board background SVG */}
      <div className="tech-stack__bg">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60 H50 M70 60 H120" stroke="rgba(0,245,212,0.04)" strokeWidth="1" fill="none" />
              <path d="M60 0 V50 M60 70 V120" stroke="rgba(0,245,212,0.04)" strokeWidth="1" fill="none" />
              <circle cx="60" cy="60" r="3" fill="rgba(0,245,212,0.06)" />
              <circle cx="0" cy="60" r="2" fill="rgba(0,245,212,0.04)" />
              <circle cx="120" cy="60" r="2" fill="rgba(0,245,212,0.04)" />
              <circle cx="60" cy="0" r="2" fill="rgba(0,245,212,0.04)" />
              <circle cx="60" cy="120" r="2" fill="rgba(0,245,212,0.04)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="container">
        <div className={`fade-up ${isVisible ? 'visible' : ''}`}>
          <div className="section-label">Tech Stack</div>
          <h2 className="section-title">Tools of the Trade</h2>
          <p className="section-subtitle">
            Battle-tested tools and platforms I use to build reliable, scalable infrastructure.
          </p>
        </div>

        <div className="tech-stack__categories">
          {TECH_CATEGORIES.map((cat, ci) => (
            <div
              key={cat.label}
              className={`tech-stack__category fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${ci * 0.1}s` }}
            >
              <h3 className="tech-stack__category-label">{cat.label}</h3>
              <div className="tech-stack__chips">
                {cat.tools.map((tool) => (
                  <div key={tool.name} className="tech-chip">
                    <span className="tech-chip__emoji">{tool.emoji}</span>
                    <span className="tech-chip__name">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
