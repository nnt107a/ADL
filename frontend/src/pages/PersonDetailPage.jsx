import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';
import { resolveImageUrl } from '../utils/imageUrl';

export default function PersonDetailPage() {
  const { id } = useParams();
  const { copy } = useLocale();
  const page = copy.pages.people;
  const person = copy.data.people.find((item) => item.id === id);

  if (!person) {
    return (
      <>
        <PageHeader kicker={page.kicker} title={page.notFound} summary={page.notFoundSummary} />

        <section className="section">
          <div className="page-header-action">
            <Link className="page-header-back-link" to="/people">
              ← {page.backToList}
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader kicker={page.kicker} title={person.name} summary="" titleClassName="page-title--detail">
        <div className="page-header-action">
          <Link className="page-header-back-link" to="/people">
            ← {page.backToList}
          </Link>
        </div>
      </PageHeader>

      <section className="section section-light reveal">
        <div className="container person-profile">
          <aside className="person-sidebar">
            <img className="person-photo-large" src={resolveImageUrl(person.photo)} alt={person.name} loading="lazy" decoding="async" />
            <h2 className="person-sidebar-name">{person.name}</h2>
            <p className="person-sidebar-role">
              {person.title}
            </p>

            <div className="person-contact">
              <h4>{page.contact}</h4>
              <a href={`tel:${person.contact.phone}`}>{person.contact.phone}</a>
              <a href={`mailto:${person.contact.email}`}>{person.contact.email}</a>
            </div>
          </aside>

          <main className="person-main">
            <section className="person-section">
              <h2>{page.biography}</h2>
              {person.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="person-section">
              <h2>{page.practiceAreas}</h2>
              <ul className="person-list">
                {person.expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="person-section">
              <h2>{page.education}</h2>
              <ul className="person-list">
                {person.education.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="person-section">
              <h2>{page.languages}</h2>
              <ul className="person-list">
                {person.languages.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      </section>
    </>
  );
}
