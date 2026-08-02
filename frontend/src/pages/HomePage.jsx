import HeroSlider from '../components/HeroSlider';
import { useLocale } from '../context/LocaleContext';

export default function HomePage() {
  const { copy } = useLocale();
  const home = copy.home;
  const clientRail = [...home.clients, ...home.clients];

  return (
    <>
      <HeroSlider slides={copy.homeSlides} />

      <section className="section section-alt reveal home-clients-section">
        <div className="container">
          <div className="section-heading-row home-clients-heading">
            <div>
              <p className="section-kicker">{home.clientsKicker}</p>
              <h2>{home.clientsTitle}</h2>
            </div>
            <p className="section-lead">{home.clientsNote}</p>
          </div>

          <div className="client-rail" aria-label={home.clientsKicker}>
            <div className="client-rail-track">
              {clientRail.map((label, index) => (
                <div className="client-rail-item" key={`${label}-${index}`}>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
