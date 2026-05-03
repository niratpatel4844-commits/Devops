import { useEffect, useRef, useState } from 'react';
import './ScrollTransition.css';

export default function ScrollTransition() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      /* Calculate progress: 0 when top of section hits middle of viewport, 1 when section is mostly scrolled */
      const start = viewportHeight / 2;
      const end = -section.offsetHeight + viewportHeight;
      
      let rawProgress = (rect.top - start) / (end - start);
      setProgress(Math.max(0, Math.min(1, rawProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* The background dot scales massively */
  const scale = 1 + progress * 30;
  
  /* The server panel fades and slides in */
  const serverOpacity = progress > 0.2 ? Math.min(1, (progress - 0.2) / 0.4) : 0;
  const blurAmount = Math.max(0, 10 - serverOpacity * 10);
  const translateY = (1 - serverOpacity) * 40;
  const scalePanel = 0.95 + serverOpacity * 0.05;

  return (
    <section className="scroll-transition" ref={sectionRef} id="scroll-transition">
      <div className="scroll-transition__sticky-container">
        
        {/* Zooming dot background */}
        <div
          className="scroll-transition__zoom-wrapper"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="scroll-transition__dot-core"></div>
          <div className="scroll-transition__dot-ring"></div>
          <div className="scroll-transition__dot-ring scroll-transition__dot-ring--outer"></div>
          <div className="scroll-transition__dot-ring scroll-transition__dot-ring--massive"></div>
        </div>

        {/* Premium Dashboard Panel */}
        <div
          className="scroll-transition__server-container"
          style={{ 
            opacity: serverOpacity, 
            transform: `translateY(${translateY}px) scale(${scalePanel})`,
            filter: `blur(${blurAmount}px)`
          }}
        >
          <div className="scroll-transition__server-header">
            <div className="scroll-transition__server-header-left">
              <div className="scroll-transition__pulse-indicator"></div>
              <h2 className="scroll-transition__server-label">MUMBAI REGION — ap-south-1</h2>
            </div>
            <div className="scroll-transition__server-latency">12ms latency</div>
          </div>
          
          <div className="scroll-transition__grid">
            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">🐳</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">Container</div>
                <div className="scroll-transition__card-desc">ECS / Fargate instances</div>
              </div>
            </div>

            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">☸️</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">K8s Pod</div>
                <div className="scroll-transition__card-desc">EKS Cluster orchestration</div>
              </div>
            </div>

            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">🔄</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">CI/CD</div>
                <div className="scroll-transition__card-desc">Automated deployment pipelines</div>
              </div>
            </div>

            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">📊</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">Monitor</div>
                <div className="scroll-transition__card-desc">Datadog metrics & tracing</div>
              </div>
            </div>

            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">🔐</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">Vault</div>
                <div className="scroll-transition__card-desc">HashiCorp secret management</div>
              </div>
            </div>

            <div className="scroll-transition__card">
              <div className="scroll-transition__card-header">
                <div className="scroll-transition__card-icon-wrapper">
                  <span className="scroll-transition__card-icon">📝</span>
                </div>
                <div className="scroll-transition__status-indicator active"></div>
              </div>
              <div className="scroll-transition__card-content">
                <div className="scroll-transition__card-title">Terraform</div>
                <div className="scroll-transition__card-desc">Infrastructure as Code</div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-transition__arrow-down" style={{ opacity: serverOpacity }}>
          <span>↓</span>
          <span className="scroll-transition__arrow-label">Scroll to explore services</span>
        </div>
      </div>
    </section>
  );
}
