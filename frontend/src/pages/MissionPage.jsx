import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops } from '../data/pageAssets';

export default function MissionPage() {
  const { copy } = useLocale();
  const page = copy.pages.mission;

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.mission}
      />

      <section className="section section-light reveal">
        <div className="container content-card">
          <h3>{page.heading}</h3>
          <p>{page.body}</p>
          <div className="sections">
            {page.sections.map((section) => (
              <div className="section" key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
