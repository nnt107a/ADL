import PageHeader from '../components/PageHeader';
import ServiceCard from '../components/ServiceCard';
import { useLocale } from '../context/LocaleContext';

export default function CapabilitiesPage() {
  const { copy } = useLocale();

  return (
    <>
      <PageHeader kicker={copy.pages.capabilities.kicker} title={copy.pages.capabilities.title} summary={copy.pages.capabilities.summary} />

      <section className="section section-light reveal">
        <div className="container cards-grid service-grid">
          {copy.data.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </>
  );
}
