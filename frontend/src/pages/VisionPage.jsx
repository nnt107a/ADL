import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';

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
