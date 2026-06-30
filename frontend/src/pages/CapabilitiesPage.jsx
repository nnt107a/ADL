import PageHeader from '../components/PageHeader';
import services from "../data/services.json";
import ServiceCard from '../components/ServiceCard';

export default function CapabilitiesPage() {
  return (
    <>
      <PageHeader
        kicker="Our Services"
        title="Support across the situations that matter most."
        summary="ADL brings together the right people, the right pace, and the right level of detail for each engagement."
      />

      <section className="section section-light reveal">
          <div className="container cards-grid service-grid">
              {services.map((service) => (
                  <ServiceCard
                      key={service.id}
                      service={service}
                  />
              ))}
          </div>
      </section>
    </>
  );
}
