import { useInView } from '../hooks/useAnimations';
import './Services.css';

const SERVICES = [
  {
    icon: '☁️',
    title: 'Cloud Infrastructure',
    description: 'Multi-cloud architecture on AWS, GCP, and Azure — scalable, secure, and cost-optimized.',
    tags: ['AWS', 'GCP', 'Azure', 'VPC'],
    command: 'aws ec2 describe-instances',
    statusColor: '#00e8ff',
    chartType: 'bar',
  },
  {
    icon: '🔄',
    title: 'CI/CD Pipelines',
    description: 'Automated build, test, and deploy pipelines that ship code faster with zero downtime.',
    tags: ['GitHub Actions', 'Jenkins', 'ArgoCD'],
    command: 'gh workflow run deploy.yml',
    statusColor: '#00e8ff',
    chartType: 'line',
  },
  {
    icon: '☸️',
    title: 'Kubernetes & Docker',
    description: 'Container orchestration at scale — from dev to prod with Helm, K8s, and Docker.',
    tags: ['K8s', 'Docker', 'Helm', 'EKS'],
    command: 'kubectl apply -f deploy.yaml',
    statusColor: '#00e8ff',
    chartType: 'dots',
  },
  {
    icon: '📊',
    title: 'Monitoring & Logging',
    description: 'Full-stack observability with real-time dashboards, alerts, and log aggregation.',
    tags: ['Prometheus', 'Grafana', 'ELK', 'Datadog'],
    command: 'promql: up{job="api"}',
    statusColor: '#00e8ff',
    chartType: 'wave',
  },
  {
    icon: '🔐',
    title: 'DevSecOps',
    description: 'Security baked into every pipeline — SAST, DAST, secrets management, and compliance.',
    tags: ['Vault', 'Trivy', 'SonarQube', 'OWASP'],
    command: 'vault kv get secret/api',
    statusColor: '#00e8ff',
    chartType: 'shield',
  },
  {
    icon: '📝',
    title: 'Infrastructure as Code',
    description: 'Declarative infra with Terraform and Pulumi — version-controlled, reproducible, auditable.',
    tags: ['Terraform', 'Pulumi', 'CloudFormation'],
    command: 'terraform apply -auto-approve',
    statusColor: '#00e8ff',
    chartType: 'blocks',
  },
];

function MiniChart({ type }) {
  if (type === 'bar') {
    return (
      <div className="mini-chart mini-chart--bar">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div key={i} className="mini-chart__bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }
  if (type === 'line') {
    return (
      <svg className="mini-chart mini-chart--line" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline
          points="0,25 15,20 30,22 45,10 60,15 75,5 100,8"
          fill="none"
          stroke="rgba(0,245,212,0.5)"
          strokeWidth="1.5"
        />
        <polyline
          points="0,25 15,20 30,22 45,10 60,15 75,5 100,8"
          fill="url(#lineGrad)"
          stroke="none"
        />
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,245,212,0.15)" />
            <stop offset="100%" stopColor="rgba(0,245,212,0)" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (type === 'dots') {
    return (
      <div className="mini-chart mini-chart--dots">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mini-chart__dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    );
  }
  if (type === 'wave') {
    return (
      <svg className="mini-chart mini-chart--wave" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15"
          fill="none"
          stroke="rgba(0,245,212,0.5)"
          strokeWidth="1.5"
          className="mini-chart__wave-path"
        />
      </svg>
    );
  }
  if (type === 'shield') {
    return (
      <div className="mini-chart mini-chart--shield">
        <span className="mini-chart__shield-icon">🛡️</span>
        <span className="mini-chart__shield-text">SECURE</span>
      </div>
    );
  }
  if (type === 'blocks') {
    return (
      <div className="mini-chart mini-chart--blocks">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mini-chart__block" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    );
  }
  return null;
}

export default function Services() {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <section className="services section-padding" id="services" ref={ref}>
      <div className="container">
        <div className={`fade-up ${isVisible ? 'visible' : ''}`}>
          <div className="section-label">Services</div>
          <h2 className="section-title">Inside the Infrastructure</h2>
          <p className="section-subtitle">
            End-to-end DevOps services to design, deploy, and maintain your cloud infrastructure.
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              className={`service-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="service-card__status-bar" style={{ background: service.statusColor }}></div>
              <div className="service-card__header">
                <span className="service-card__icon">{service.icon}</span>
                <h3 className="service-card__title">{service.title}</h3>
              </div>
              <p className="service-card__desc">{service.description}</p>

              <MiniChart type={service.chartType} />

              <div className="service-card__tags">
                {service.tags.map(tag => (
                  <span key={tag} className="service-card__tag">{tag}</span>
                ))}
              </div>
              <div className="service-card__command">
                <span className="service-card__command-prompt">$</span>
                <span className="service-card__command-text">{service.command}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
