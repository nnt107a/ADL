import HeroSlider from '../components/HeroSlider';
import homeSlides from '../data/homeSlides';

export default function HomePage() {
  return (
    <HeroSlider slides={homeSlides} />
  );
}
