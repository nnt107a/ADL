import PageHeader from '../components/PageHeader';
import PersonCard from '../components/PersonCard';
import { useLocale } from '../context/LocaleContext';

export default function PeoplePage() {
  const { copy } = useLocale();

  return (
    <>
      <PageHeader kicker={copy.pages.people.kicker} summary={copy.pages.people.summary} featured/>

      <section className="section section-light reveal">
        <div className="container cards-grid people-grid">
          {copy.data.people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </section>
    </>
  );
}
