import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

export default function CareersPage() {
  const { copy } = useLocale();
  const page = copy.pages.careers;

  return (
    <>
      <PageHeader kicker={page.kicker} title={page.title} summary={page.summary} />

      <section className="section section-dark reveal">
        <div className="container careers-grid">
          <div className="careers-copy">
            <p className="section-kicker section-kicker-dark">{page.whyJoin}</p>
            <h2>{page.title2}</h2>
            <p>{page.body}</p>
            <ul className="career-benefits">
              {page.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <article className="career-card">
            <p className="content-label">{page.openOpportunities}</p>
            <h3>{page.rolesHeading}</h3>
            <ul className="role-list">
              {page.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
            <Link className="button button-primary" to="/contact">
              {page.sendCv}
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
