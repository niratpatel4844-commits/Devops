import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hero.css';

// Helper for lerping colors
function lerp(start, end, t) {
  return start + (end - start) * t;
}

function getOverlayColor(p) {
  if (p < 0.3) {
    const t = p / 0.3;
    return `rgba(100,160,255,${(t * 0.3).toFixed(3)})`;
  } else if (p < 0.6) {
    const t = (p - 0.3) / 0.3;
    return `rgba(${Math.round(lerp(100,251,t))},${Math.round(lerp(160,191,t))},${Math.round(lerp(255,36,t))},${lerp(0.3,0.4,t).toFixed(3)})`;
  } else {
    const t = (p - 0.6) / 0.4;
    return `rgba(251,191,36,${(0.4 * (1-t)).toFixed(3)})`;
  }
}

export default function Hero() {
  const canvasRef = useRef(null);
  
  const threeJsWrapperRef = useRef(null);
  const htmlOverlayRef = useRef(null);
  const atmosphereOverlayRef = useRef(null);
  const regionPanelRef = useRef(null);
  const skipBtnRef = useRef(null);
  const scrollPromptRef = useRef(null);

  // Three.js Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    // Adjusted z to 3.5 so the Earth fits well with the orbital ring, but keeps the cinematic scale
    camera.position.z = 3.5; 

    const loader = new THREE.TextureLoader();
    const earthTexture  = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    const specularMap   = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
    const normalMap     = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg');
    const cloudTexture  = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png');

    // Earth
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map:          earthTexture,
      specularMap:  specularMap,
      normalMap:    normalMap,
      specular:     new THREE.Color(0x334466),
      shininess:    18,
      normalScale:  new THREE.Vector2(0.85, 0.85),
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(earth);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(1.008, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map:         cloudTexture,
      transparent: true,
      opacity:     0.82,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    clouds.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(clouds);

    // Atmosphere Shader
    const atmGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.5, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffddaa, 2.2);
    sunLight.position.set(-2.5, 2.0, 1.5);
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0x220033, 0.35);
    scene.add(ambient);

    const fillLight = new THREE.DirectionalLight(0x334488, 0.15);
    fillLight.position.set(3, -1, 1);
    scene.add(fillLight);

    // Star Field
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 20;
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);

      const type = Math.random();
      if (type > 0.95) {
        sizes[i] = 3.5 + Math.random() * 3;
        colors[i*3] = 1; colors[i*3+1] = 0.95; colors[i*3+2] = 0.9;
      } else if (type > 0.85) {
        sizes[i] = 1.5 + Math.random() * 1;
        colors[i*3] = 1; colors[i*3+1] = 0.9; colors[i*3+2] = 0.6;
      } else {
        sizes[i] = 0.5 + Math.random() * 1;
        colors[i*3] = 0.8; colors[i*3+1] = 0.85; colors[i*3+2] = 1;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      earth.rotation.y += 0.0003;
      clouds.rotation.y += 0.0004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmGeo.dispose();
      atmMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, []);

  // Scroll logic
  useEffect(() => {
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = null;
    let isRunning = false;

    const applyProgress = (p) => {
      const scale = 1 + p * 9;
      const fade = Math.max(0, 1 - p * 2.2);
      const panelOpacity = Math.max(0, (p - 0.55) * 4);
      const panelY = Math.max(0, (1 - (p - 0.55) * 4)) * 40;
      
      if (threeJsWrapperRef.current) {
        threeJsWrapperRef.current.style.transform = `scale(${scale}) translateZ(0)`;
        threeJsWrapperRef.current.style.opacity = fade;
        threeJsWrapperRef.current.style.pointerEvents = fade <= 0 ? 'none' : 'auto';
      }
      if (htmlOverlayRef.current) {
        htmlOverlayRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) translateZ(0)`;
        htmlOverlayRef.current.style.opacity = fade;
      }
      if (atmosphereOverlayRef.current) {
        atmosphereOverlayRef.current.style.backgroundColor = getOverlayColor(p);
      }
      if (regionPanelRef.current) {
        regionPanelRef.current.style.opacity = panelOpacity;
        regionPanelRef.current.style.transform = `translateY(${panelY}px) translateZ(0)`;
        regionPanelRef.current.style.pointerEvents = panelOpacity > 0.5 ? 'auto' : 'none';
        
        if (panelOpacity > 0.8) {
          regionPanelRef.current.classList.add('cards-visible');
        } else {
          regionPanelRef.current.classList.remove('cards-visible');
        }
      }
      if (skipBtnRef.current) {
        const btnFade = Math.max(0, 1 - p * 2);
        skipBtnRef.current.style.opacity = btnFade;
        skipBtnRef.current.style.pointerEvents = btnFade > 0 ? 'auto' : 'none';
      }
      if (scrollPromptRef.current) {
        scrollPromptRef.current.style.opacity = Math.max(0, 1 - p * 4);
      }
    };

    const startLoop = () => {
      isRunning = true;
      const loop = () => {
        currentProgress += (targetProgress - currentProgress) * 0.08;
        applyProgress(currentProgress);
        if (Math.abs(targetProgress - currentProgress) > 0.0005) {
          rafId = requestAnimationFrame(loop);
        } else {
          isRunning = false;
        }
      };
      rafId = requestAnimationFrame(loop);
    };

    const handleScroll = () => {
      const scrollEl = document.getElementById('scroll-driver');
      if (!scrollEl) return;
      const rect = scrollEl.getBoundingClientRect();
      const total = scrollEl.offsetHeight - window.innerHeight;
      targetProgress = Math.max(0, Math.min(1, -rect.top / total));
      if (!isRunning) startLoop();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const skipToRegion = () => {
    const scrollEl = document.getElementById('scroll-driver');
    if (!scrollEl) return;
    const rect = scrollEl.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height - window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="hero-scroll-section" id="scroll-driver">
      <div className="hero-sticky-wrapper">
        
        {/* Three.js Canvas Full Screen */}
        <div className="three-wrapper" ref={threeJsWrapperRef}>
          <canvas id="earth-canvas" ref={canvasRef} />
        </div>

        {/* Sun Flare overlay */}
        <div className="sun-flare"></div>
        <div className="flare-streak"></div>

        <button ref={skipBtnRef} className="skip-btn" onClick={skipToRegion}>
          Skip to Region ↘
        </button>

        {/* HTML Overlays that scale with the Earth */}
        <div className="html-planet-container" ref={htmlOverlayRef}>
          <div className="orbital-ring">
            <svg width="1000" height="340" viewBox="0 0 1000 340">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(251,191,36,0)" />
                  <stop offset="70%" stopColor="rgba(251,191,36,0.3)" />
                  <stop offset="100%" stopColor="rgba(251,191,36,0.8)" />
                </linearGradient>
              </defs>
              <ellipse cx="500" cy="170" rx="480" ry="150" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="0.5" />
              <ellipse cx="500" cy="170" rx="495" ry="160" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="15 10" style={{animation: 'dashMove 20s linear infinite'}} />
            </svg>
          </div>
          
          <div className="satellites-container">
            <div className="satellite sat-1">
              <div className="sat-item">
                <div className="sat-trail inactive-trail"></div>
                <div className="sat-core inactive"></div>
              </div>
            </div>
            
            <div className="satellite sat-2">
              <div className="sat-item">
                <div className="sat-trail inactive-trail"></div>
                <div className="sat-core inactive"></div>
              </div>
            </div>
            
            <div className="satellite sat-3">
              <div className="sat-item">
                <div className="sat-trail"></div>
                <div className="sat-ping"></div>
                <div className="sat-core"></div>
                <div className="sat-label-container">
                  <div className="region-label">
                    <div className="region-dot"></div>
                    ap-south-1
                    <span className="region-cursor">_</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="satellite sat-4">
              <div className="sat-item">
                <div className="sat-trail inactive-trail"></div>
                <div className="sat-core inactive"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-prompt" ref={scrollPromptRef}>
          <p>SCROLL TO ENTER REGION</p>
          <div className="bounce-arrow">↓</div>
        </div>

        <div className="atmosphere-overlay" ref={atmosphereOverlayRef}></div>

        <div className="region-panel-wrapper" ref={regionPanelRef}>
          <div className="region-panel">
            <div className="region-header">
              <div className="region-header-left">
                <div className="pulse-dot"></div>
                <h2 className="region-title">MUMBAI REGION — ap-south-1</h2>
              </div>
              <div className="latency-badge">12ms latency</div>
            </div>

            <div className="cards-grid">
              <ServiceCard icon="🐳" title="Container" desc="ECS / Fargate instances" delay={0} />
              <ServiceCard icon="☸️" title="K8s Pod" desc="EKS Cluster orchestration" delay={100} />
              <ServiceCard icon="🔄" title="CI/CD" desc="Automated deployment pipelines" delay={200} />
              <ServiceCard icon="📊" title="Monitor" desc="Datadog metrics & tracing" delay={300} />
              <ServiceCard icon="🔐" title="Vault" desc="HashiCorp secret management" delay={400} />
              <ServiceCard icon="📝" title="Terraform" desc="Infrastructure as Code" delay={500} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function ServiceCard({ icon, title, desc, delay }) {
  return (
    <div 
      className="service-card"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="status-dot"></div>
      </div>
      <div className="card-content">
        <div className="card-title">{title}</div>
        <div className="card-desc">{desc}</div>
      </div>
    </div>
  );
}
