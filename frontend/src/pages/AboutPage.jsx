import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PageSEO from '../components/PageSEO';
import MediaPlaceholder from '../components/MediaPlaceholder';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';

export default function AboutPage() {
  const { copy, locale } = useLocale();
  const page = copy.pages.about;

  return (
    <>
      <PageSEO
        title={page.title || 'About AD Legal'}
        description={page.summary || 'Learn about AD Legal — our story, values, mission, and the team behind Vietnam\'s integrated legal and financial advisory firm.'}
        url="https://adlegal.vn/about"
        locale={locale}
      />
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.about}
        {...pageHeaderThemes.about}
        kickerColor='white'
        titleColor='white'
        summaryColor='white'
      />

      <section className="section section-light reveal">
        <div className="container about-grid">
          <article className="content-card">
            <p className="content-label">{page.introLabel}</p>
            {/* <h3>{page.introTitle}</h3> */}
            <div className="about-copy">
              {page.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {page.brochure ? (
                <p className="brochure-link-line">
                  {page.brochure.textBefore}
                  <a
                    href={page.brochure.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brochure-inline-link"
                  >
                    {page.brochure.linkText}
                  </a>
                </p>
              ) : null}
            </div>
          </article>

          <div className="value-stack">
            {page.values.map((value) => (
              <article className="value-card" key={value.title}>
                <span className="value-index">{value.index}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt reveal">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">{page.exploreKicker}</p>
              <h4>{page.exploreTitle}</h4>
            </div>
          </div>

          <div className="cards-grid about-mini-grid">
            {page.sections.map((section) => (
              <Link className="about-link-card" key={section.id} id={section.id} to={section.path}>
                <p className="content-label">{section.kicker}</p>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
                <span className="page-header-back-link">{section.action}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
