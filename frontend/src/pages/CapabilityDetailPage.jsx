import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';

export default function CapabilityDetailPage() {
  const { id } = useParams();
  const { copy } = useLocale();
  const page = copy.pages.capabilities;
  const service = copy.data.services.find((item) => item.id === id);

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
        kicker={page.kicker}
        title={service.title}
        summary={service.shortDescription}
        featured
        backdropClassName="page-header-backdrop--service"
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
          </section>
        </div>
      </section>
    </>
  );
}
