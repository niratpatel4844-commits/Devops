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
