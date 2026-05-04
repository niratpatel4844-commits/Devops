import Navbar from './components/Navbar';
import Hero from './components/Hero';

import Services from './components/Services';
import WhyMe from './components/WhyMe';
import TechStack from './components/TechStack';
import Testimonials from './components/Testimonials';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <div className="hud-shell" aria-hidden="true">
        <span className="hud-corner hud-corner--tl" />
        <span className="hud-corner hud-corner--tr" />
        <span className="hud-corner hud-corner--bl" />
        <span className="hud-corner hud-corner--br" />
        <div className="hud-shell__scanlines" />
      </div>
      <div className="hud-statusbar" aria-hidden="true">
        <span className="hud-statusbar__left">DEVOPS<span className="hud-statusbar__accent">X</span> · INTERFACE v2.1</span>
        <span className="hud-statusbar__center">UPLINK SECURE · ALL SYSTEMS NOMINAL</span>
        <span className="hud-statusbar__right">RENDER: HOLOGRAPHIC</span>
      </div>
      <Navbar />
      <main>
        <Hero />

        <Services />
        <WhyMe />
        <TechStack />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}

export default App;
