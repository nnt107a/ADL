import HeroSlider from '../components/HeroSlider';
import PageSEO from '../components/PageSEO';
import { useLocale } from '../context/LocaleContext';
import { homePartnerLogos } from '../data/pageAssets';

export default function HomePage() {
  const { copy, locale } = useLocale();
  const home = copy.home;
  const clientRail = [...homePartnerLogos, ...homePartnerLogos];

  return (
    <>
      <PageSEO
        description="AD Legal is a multi-disciplinary legal and financial advisory firm in Vietnam. We provide integrated legal, tax, and finance solutions to businesses."
        url="https://adlegal.vn"
        locale={locale}
      />
      <HeroSlider slides={copy.homeSlides} />

      <section className="section section-alt reveal home-clients-section">
        <div className="container">
          <div className="section-heading-row home-clients-heading">
            <div>
              <p className="section-kicker" style={{ fontSize: '2rem' }}>{home.clientsKicker}</p>
              <h2>{home.clientsTitle}</h2>
            </div>
          </div>

          <div className="client-rail" aria-label={home.clientsKicker}>
            <div className="client-rail-track">
              {clientRail.map((logo, index) => (
                <div className="client-rail-item" key={`${logo.alt}-${index}`}>
                  <img src={logo.src} alt={logo.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
