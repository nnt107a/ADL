import PageHeader from "../components/PageHeader";
import PersonCard from "../components/PersonCard";
import people from "../data/people.json";

export default function PeoplePage() {
    return (
        <>
            <PageHeader
                kicker="People"
                title="Our People"
                summary="Meet the professionals behind AD Legal."
            />

            <section className="section section-light reveal">
                <div className="container cards-grid people-grid">
                    {people.map((person) => (
                        <PersonCard
                            key={person.id}
                            person={person}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}