import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';
import { serviceBackdrops, serviceHeaderThemes } from '../data/pageAssets';

export default function CapabilityDetailPage() {
  const { id } = useParams();
  const { copy } = useLocale();
  const page = copy.pages.capabilities;
  const service = copy.data.services.find((item) => item.id === id);
  const backdropImage = id ? serviceBackdrops[id] : '';
  const headerTheme = id ? serviceHeaderThemes[id] : null;

  if (!service) {
    return (
      <section className="section">
        <div className="container">
          <h2>{page.notFound}</h2>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        kicker={service.title}
        summary={service.shortDescription}
        featured
        backdropClassName="page-header-backdrop--service"
        backdropImage={backdropImage}
        {...(headerTheme || {})}
        kickerColor = 'white'
        titleColor = 'white'
        summaryColor = 'white'
      >
        <div className="page-header-action">
          <Link className="page-header-back-link" to="/services">
            ← {page.backToList}
          </Link>
        </div>
      </PageHeader>

      <section className="section section-light">
        <div className="container service-detail">
          <section className="service-section">
            <h2>{page.overview}</h2>
            {service.overview.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>

          <section className="service-section">
            <h2>{page.coreServices}</h2>
            <ul className="service-list">
              {service.services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="service-section">
            <h2>{page.selectedProjects}</h2>
            <ul className="project-list">
              {service.representativeProjects.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ul>
            {service.brochure ? (
              <p className="brochure-link-line service-brochure-line">
                {service.brochure.textBefore}
                <a
                  href={service.brochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brochure-inline-link"
                >
                  {service.brochure.linkText}
                </a>
                {service.brochure.textAfter || ''}
              </p>
            ) : null}
          </section>
        </div>
      </section>
    </>
  );
}
