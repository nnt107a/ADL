import PageHeader from '../components/PageHeader';

const sections = [
  {
    title: 'Clear, Practical Legal Advice',
    description:
      'We provide legal guidance that is easy to understand, commercially relevant, and focused on helping clients make informed decisions quickly.',
  },
  {
    title: 'Business-Focused Solutions',
    description:
      'Every recommendation is tailored to each client\'s commercial objectives, balancing legal compliance with practical business needs while maintaining the highest standards of ethics and professional responsibility.',
  },
  {
    title: 'Integrity and Professional Excellence',
    description:
      'We maintain the highest standards of ethics, accountability, and professional responsibility while building long-term trust with every client.'
  }
];

export default function MissionPage() {
  return (
    <>
      <PageHeader
        kicker="Mission"
        title="Our mission is to empower confident business decisions."
        summary="We provide clear, practical legal advice that helps businesses make confident decisions through flexible, business-focused solutions delivered with professionalism and integrity."
      />

      <section className="section section-light reveal">
        <div className="container content-card">
          <h3>What drives our work</h3>
          <p>Everything we do is guided by a commitment to delivering practical legal value that helps businesses move forward with confidence.</p>
          <div className="sections">
            {sections.map((section) => (
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
