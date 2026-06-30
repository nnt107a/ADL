import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const highlights = [
  'Direct access to senior advisors',
  'Clear milestones and feedback loops',
  'Practical documentation and follow-up',
];

const values = [
  {
    index: '01',
    title: 'Commercial clarity',
    text: 'We translate complexity into a clear decision path and a defined next step.',
  },
  {
    index: '02',
    title: 'Trusted collaboration',
    text: 'Clients work directly with the people who shape the advice and the delivery.',
  },
  {
    index: '03',
    title: 'Long-term perspective',
    text: 'We think beyond the immediate task and support the wider business outcome.',
  },
];

const aboutSections = [
  {
    id: 'news',
    kicker: 'News',
    title: 'Latest updates and company announcements.',
    text: 'Use this section for firm news, achievements, launches, and important announcements.',
  },
  {
    id: 'mission',
    kicker: 'Mission',
    title: 'Our mission page is ready.',
    text: 'Visit the Mission page for a placeholder summary of your firm purpose.',
    path: '/mission',
  },
  {
    id: 'vision',
    kicker: 'Vision',
    title: 'Our vision page is ready.',
    text: 'Visit the Vision page for a placeholder summary of your future direction.',
    path: '/vision',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About Us"
        title="We help organizations move with confidence."
        summary="Our work blends strategic thinking, operational awareness, and disciplined delivery so teams can act quickly without losing sight of risk."
      />

      <section className="section section-light reveal">
        <div className="container about-grid">
          <article className="content-card">
            <p className="content-label">Our approach</p>
            <h3>A straightforward process built around your priorities.</h3>
            <p>
              We begin with the facts, define the business objective, and shape advice that can be
              used immediately. The result is a practical plan that clients can explain and execute.
            </p>
            <div className="inline-points">
              {highlights.map((item) => (
                <span key={item}>{item}</span>
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
        <div className="container cards-grid about-mini-grid">
          {aboutSections.map((section) => (
            <article className="service-card" key={section.id} id={section.id}>
              <p className="content-label">{section.kicker}</p>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
              {section.path ? (
                <Link className="card-link" to={section.path}>
                  Open page
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
