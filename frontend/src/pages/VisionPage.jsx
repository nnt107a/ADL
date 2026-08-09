import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';

export default function VisionPage() {
  const { copy } = useLocale();
  const page = copy.pages.vision;

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.vision}
        {...pageHeaderThemes.vision}
        kickerColor='white'
        titleColor='white'
        summaryColor='white'
      />

      <section className="section section-light reveal">
        <div className="container">
          <article className="content-card">
            <p className="content-label">{page.kicker}</p>
            {/* <h3>{page.heading}</h3> */}
            <p className="section-lead" style={{ marginTop: '0.5rem' }}>
              {page.body}
            </p>
          </article>

          <div className="cards-grid about-mini-grid" style={{ marginTop: '1.5rem' }}>
            {page.sections.map((section, idx) => (
              <article className="value-card" key={section.title}>
                <span className="value-index">{String(idx + 1).padStart(2, '0')}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
