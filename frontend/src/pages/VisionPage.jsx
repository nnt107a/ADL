import PageHeader from '../components/PageHeader';

const sections = [
  {
    title: 'A Trusted Long-Term Partner',
    description:
      'We strive to become the legal advisor that businesses rely on throughout every stage of their growth.',
  },
  {
    title: 'Raising Professional Standards',
    description:
      'We are committed to delivering consistently high-quality legal services while helping elevate professional standards across Vietnam\'s legal industry.',
  },
  {
    title: 'Growing Together',
    description:
      'We foster an environment where lawyers and professionals continue to learn, collaborate, and develop, enabling us to better serve our clients and contribute to the business community.'
  }
];

export default function VisionPage() {
  return (
    <>
      <PageHeader
        kicker="Vision"
        title="Our vision is to become one of Vietnam's most trusted legal advisors."
        summary="We strive to be recognized for legal excellence, practical thinking, and the highest professional standards while contributing to a stronger and more sustainable business community."
      />

      <section className="section section-alt reveal">
        <div className="container content-card">
          <h3>Where we're heading</h3>
          <p>
            Our long-term vision extends beyond providing legal services—we aim to help shape a more professional legal industry and support sustainable business growth.
          </p>
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
