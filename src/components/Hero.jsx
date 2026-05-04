import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hero.css';

// Helper for lerping colors
function lerp(start, end, t) {
  return start + (end - start) * t;
}

function getOverlayColor(p) {
  if (p < 0.32) {
    const t = p / 0.32;
    return `rgba(0, 40, 70, ${(t * 0.28).toFixed(3)})`;
  }
  if (p < 0.62) {
    const t = (p - 0.32) / 0.3;
    return `rgba(${Math.round(lerp(0, 0, t))},${Math.round(lerp(60, 120, t))},${Math.round(lerp(100, 200, t))},${lerp(0.22, 0.4, t).toFixed(3)})`;
  }
  const t = (p - 0.62) / 0.38;
  return `rgba(0, 232, 255, ${(0.38 * (1 - t)).toFixed(3)})`;
}

export default function Hero() {
  const canvasRef = useRef(null);
  
  const threeJsWrapperRef = useRef(null);
  const htmlOverlayRef = useRef(null);
  const atmosphereOverlayRef = useRef(null);
  const regionPanelRef = useRef(null);
  const scrollPromptRef = useRef(null);
  const heroHudChromeRef = useRef(null);

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

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = 1;
      }
    };

    const loader = new THREE.TextureLoader(manager);
    const earthTexture  = loader.load('/textures/earth_atmos_2048.jpg');
    const specularMap   = loader.load('/textures/earth_specular_2048.jpg');
    const normalMap     = loader.load('/textures/earth_normal_2048.jpg');
    const cloudTexture  = loader.load('/textures/earth_clouds_1024.png');

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
          gl_FragColor = vec4(0.12, 0.88, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    // Sun (3D, procedural surface + corona — matches scene lighting direction)
    const sunDistance = 9.5;
    const sunDir = new THREE.Vector3(-2.5, 2.0, 1.5).normalize();
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunDir.clone().multiplyScalar(sunDistance));

    const sunSurfaceUniforms = {
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
    };
    const sunSurfaceVertex = `
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vec4 wPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = wPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const sunSurfaceFragment = `
      uniform float uTime;
      uniform vec3 uCameraPosition;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 n = normalize(vWorldNormal);
        vec3 p = vWorldPos * 1.4 + uTime * 0.04;
        float gran = fbm(p);
        float gran2 = fbm(p * 2.3 + 10.0);
        float spots = smoothstep(0.35, 0.9, gran * gran2);

        float lat = atan(n.z, length(n.xy)) / 3.14159;
        float bands = sin(lat * 18.0 + uTime * 0.15) * 0.5 + 0.5;

        vec3 core = vec3(1.0, 0.98, 0.92);
        vec3 mid = vec3(1.0, 0.72, 0.28);
        vec3 rim = vec3(0.95, 0.35, 0.08);
        vec3 deep = vec3(0.55, 0.12, 0.02);

        float t = gran * 0.55 + bands * 0.25 + spots * 0.35;
        vec3 col = mix(deep, rim, smoothstep(0.0, 0.45, t));
        col = mix(col, mid, smoothstep(0.25, 0.75, t));
        col = mix(col, core, smoothstep(0.65, 1.0, t));

        vec3 toCam = normalize(uCameraPosition - vWorldPos);
        float facing = max(0.0, dot(n, toCam));
        float hotCore = pow(facing, 5.0);
        float limb = pow(facing, 0.45);
        col *= mix(0.72, 1.0, limb);
        col += vec3(1.0, 0.96, 0.88) * hotCore * 0.55;
        col += vec3(1.0, 0.85, 0.45) * pow(facing, 12.0) * 0.35;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const sunGeo = new THREE.SphereGeometry(0.58, 72, 72);
    const sunMat = new THREE.ShaderMaterial({
      uniforms: sunSurfaceUniforms,
      vertexShader: sunSurfaceVertex,
      fragmentShader: sunSurfaceFragment,
      toneMapped: false,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.renderOrder = 1;
    sunGroup.add(sunMesh);

    const coronaUniforms = { uTime: { value: 0 } };
    const coronaVertex = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const coronaFragment = `
      uniform float uTime;
      varying vec3 vNormal;
      void main() {
        float fresnel = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
        float pulse = 0.92 + 0.08 * sin(uTime * 1.2);
        vec3 c = mix(vec3(1.0, 0.45, 0.05), vec3(1.0, 0.85, 0.35), fresnel) * fresnel * 1.35 * pulse;
        gl_FragColor = vec4(c, fresnel * 0.55);
      }
    `;
    const coronaGeo = new THREE.SphereGeometry(0.7, 48, 48);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: coronaUniforms,
      vertexShader: coronaVertex,
      fragmentShader: coronaFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      toneMapped: false,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    coronaMesh.renderOrder = 0;
    sunGroup.add(coronaMesh);

    const sunGlowGeo = new THREE.SphereGeometry(0.82, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffb060,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGroup.add(sunGlow);

    // Lighting (keep original vector so Earth shading matches the scene)
    const sunLight = new THREE.DirectionalLight(0xffddaa, 2.2);
    sunLight.position.set(-2.5, 2.0, 1.5);
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0x001828, 0.42);
    scene.add(ambient);

    const fillLight = new THREE.DirectionalLight(0x2266aa, 0.22);
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
        colors[i*3] = 0.65; colors[i*3+1] = 0.88; colors[i*3+2] = 1;
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

    scene.add(sunGroup);

    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      earth.rotation.y += 0.0003;
      clouds.rotation.y += 0.0004;
      sunSurfaceUniforms.uTime.value = t;
      sunSurfaceUniforms.uCameraPosition.value.copy(camera.position);
      coronaUniforms.uTime.value = t;
      sunMesh.rotation.y = t * 0.012;
      sunMesh.rotation.x = t * 0.006;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      
      if (w < 768) {
        const baseScale = Math.max(0.4, w / 768);
        camera.position.z = 3.5 / baseScale;
      } else {
        camera.position.z = 3.5;
      }
      
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

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
      sunGeo.dispose();
      sunMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      sunGlowGeo.dispose();
      sunGlowMat.dispose();
      scene.remove(sunGroup);
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
        const baseS = window.innerWidth < 768 ? Math.max(0.4, window.innerWidth / 768) : 1;
        htmlOverlayRef.current.style.transform = `translate(-50%, -50%) scale(${scale * baseS}) translateZ(0)`;
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
      const btnFade = Math.max(0, 1 - p * 2);
      if (heroHudChromeRef.current) {
        heroHudChromeRef.current.style.opacity = String(btnFade);
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
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-scroll-section" id="scroll-driver">
      <div className="hero-sticky-wrapper">
        
        {/* Three.js Canvas Full Screen */}
        <div className="three-wrapper" ref={threeJsWrapperRef}>
          <canvas id="earth-canvas" ref={canvasRef} style={{ opacity: 0, transition: 'opacity 1.5s ease-in-out' }} />
        </div>

        {/* Sun Flare overlay */}
        <div className="sun-flare"></div>
        <div className="flare-streak"></div>

        <div className="hero-hud-chrome" ref={heroHudChromeRef} aria-hidden="true">
          <div className="hero-hud-chrome__corners">
            <span className="hero-hud-chrome__corner hero-hud-chrome__corner--tl" />
            <span className="hero-hud-chrome__corner hero-hud-chrome__corner--tr" />
            <span className="hero-hud-chrome__corner hero-hud-chrome__corner--bl" />
            <span className="hero-hud-chrome__corner hero-hud-chrome__corner--br" />
          </div>
          <div className="hero-hud-chrome__rail hero-hud-chrome__rail--left" />
          <div className="hero-hud-chrome__rail hero-hud-chrome__rail--right" />
          <div className="hero-hud-readout hero-hud-readout--tl">
            <div className="hero-hud-readout__line">
              <span className="hero-hud-readout__k">UPLINK</span>
              <span className="hero-hud-readout__v">SECURE</span>
            </div>
            <div className="hero-hud-readout__line">
              <span className="hero-hud-readout__k">NODE</span>
              <span className="hero-hud-readout__v">EARTH_ORBIT</span>
            </div>
            <div className="hero-hud-readout__line">
              <span className="hero-hud-readout__k">LAYER</span>
              <span className="hero-hud-readout__v">HOLO_01</span>
            </div>
          </div>
          <div className="hero-hud-readout hero-hud-readout--br">
            <div className="hero-hud-readout__line">
              <span className="hero-hud-readout__k">TZ</span>
              <span className="hero-hud-readout__v">UTC+05:30</span>
            </div>
            <div className="hero-hud-readout__line">
              <span className="hero-hud-readout__k">TARGET</span>
              <span className="hero-hud-readout__v">AP_SOUTH_1</span>
            </div>
          </div>
        </div>

        {/* HTML Overlays that scale with the Earth */}
        <div className="html-planet-container" ref={htmlOverlayRef}>
          <div className="orbital-ring">
            <svg width="1000" height="340" viewBox="0 0 1000 340">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,232,255,0)" />
                  <stop offset="70%" stopColor="rgba(0,232,255,0.28)" />
                  <stop offset="100%" stopColor="rgba(0,232,255,0.85)" />
                </linearGradient>
                <linearGradient id="ring-grad-inner" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,232,255,0)" />
                  <stop offset="55%" stopColor="rgba(0,232,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(0,232,255,0.55)" />
                </linearGradient>
              </defs>
              <ellipse cx="500" cy="170" rx="480" ry="150" fill="none" stroke="rgba(0,232,255,0.22)" strokeWidth="0.5" />
              <ellipse cx="500" cy="170" rx="495" ry="160" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="15 10" style={{ animation: 'dashMove 20s linear infinite' }} />
              <ellipse cx="500" cy="170" rx="418" ry="132" fill="none" stroke="rgba(0,232,255,0.12)" strokeWidth="0.5" />
              <ellipse cx="500" cy="170" rx="432" ry="138" fill="none" stroke="url(#ring-grad-inner)" strokeWidth="1.2" strokeDasharray="10 14" style={{ animation: 'dashMoveReverse 26s linear infinite' }} />
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
          <p className="scroll-prompt__text">
            <span className="scroll-prompt__bracket" aria-hidden="true">[</span>
            <span className="scroll-prompt__label">SCROLL TO ENTER REGION</span>
            <span className="scroll-prompt__bracket" aria-hidden="true">]</span>
          </p>
          <div className="bounce-arrow" aria-hidden="true">↓</div>
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
