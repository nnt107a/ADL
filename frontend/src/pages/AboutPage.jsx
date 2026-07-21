import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const aboutParagraphs = [
  'AD Legal is a team of experienced lawyers and financial professionals united by a shared commitment to delivering comprehensive, effective, and commercially pragmatic legal services.',
  'Combining sound legal expertise with financial and commercial insight, we develop flexible solutions tailored to the evolving needs of businesses in a dynamic marketplace.',
  'Guided by professionalism, dedication, and innovation, AD Legal is committed to supporting clients in managing legal risks, enhancing operational efficiency, and laying the groundwork for sustainable growth.',
];

const values = [
  {
    index: '01',
    title: 'Legal depth',
    text: 'Experienced counsel for decisions that require precision, judgment, and dependable execution.',
  },
  {
    index: '02',
    title: 'Financial perspective',
    text: 'Commercial and financial insight built into advice, documentation, and transaction strategy.',
  },
  {
    index: '03',
    title: 'Practical outcomes',
    text: 'Flexible solutions shaped around risk management, operational efficiency, and sustainable growth.',
  },
];

const aboutSections = [
  {
    id: 'news',
    kicker: 'News',
    title: 'Firm news and updates',
    text: 'Follow recent developments, announcements, and selected perspectives from AD Legal.',
    path: '/news',
    action: 'Read updates',
  },
  {
    id: 'mission',
    kicker: 'Mission',
    title: 'The purpose behind our work',
    text: 'Learn how AD Legal defines its role in helping clients navigate legal and commercial challenges.',
    path: '/mission',
    action: 'View mission',
  },
  {
    id: 'vision',
    kicker: 'Vision',
    title: 'The standard we are building toward',
    text: 'See the long-term direction guiding our service quality, professional growth, and client impact.',
    path: '/vision',
    action: 'View vision',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About Us"
        title="Comprehensive legal services shaped by commercial insight."
        summary="AD Legal brings together legal, financial, and business perspectives to help clients make confident decisions in a changing marketplace."
      />

      <section className="section section-light reveal">
        <div className="container about-grid">
          <article className="content-card">
            <p className="content-label">Who we are</p>
            <h3>Experienced lawyers and financial professionals working as one team.</h3>
            <div className="about-copy">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="value-stack">
            {values.map((value) => (
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
              <p className="section-kicker">Explore AD Legal</p>
              <h2>Learn more about our direction, work, and updates.</h2>
            </div>
          </div>

          <div className="cards-grid about-mini-grid">
            {aboutSections.map((section) => (
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
