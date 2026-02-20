import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import EventsSection from '../components/EventsSection';
import ActivitiesSection from '../components/ActivitiesSection';
import ShopSection from '../components/ShopSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSlider />
      <EventsSection />
      <ActivitiesSection />
      <ShopSection />
      <Footer />
    </div>
  );
}
