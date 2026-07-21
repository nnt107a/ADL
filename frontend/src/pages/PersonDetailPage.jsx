import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import people from "../data/people.json";

export default function PersonDetailPage() {
    const { id } = useParams();

    const person = people.find((p) => p.id === id);

    if (!person) {
        return (
            <>
                <PageHeader
                    kicker="People"
                    title="Profile not found"
                    summary="The requested team member could not be found."
                />

                <section className="section">
                    <div className="container">
                        <Link className="page-header-back-link" to="/people">
                            ← Back to People
                        </Link>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <PageHeader
                kicker="People"
                title={person.name}
                summary=""
            >
                <div className="page-header-action">
                    <Link className="page-header-back-link" to="/people">
                        ← Back to People
                    </Link>
                </div>
            </PageHeader>

            <section className="section section-light reveal">
                <div className="container person-profile">

                    <aside className="person-sidebar">
                      <img
                          className="person-photo-large"
                          src={person.photo}
                          alt={person.name}
                      />

                      <h2 className="person-sidebar-name">
                          {person.name}
                      </h2>

                      <p className="person-sidebar-role">
                          {person.title}
                      </p>

                      <div className="person-contact">
                          <h4>Contact</h4>

                          <a href={`tel:${person.contact.phone}`}>
                              {person.contact.phone}
                          </a>

                          <a href={`mailto:${person.contact.email}`}>
                              {person.contact.email}
                          </a>
                      </div>

                  </aside>

                    <main className="person-main">

                        <section className="person-section">
                            <h2>Biography</h2>

                            {person.biography.map((paragraph) => (
                                <p key={paragraph}>
                                    {paragraph}
                                </p>
                            ))}
                        </section>

                        <section className="person-section">
                            <h2>Areas of Practice</h2>

                            <ul className="person-list">
                                {person.expertise.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="person-section">
                            <h2>Education & Qualifications</h2>

                            <ul className="person-list">
                                {person['education & qualifications'].map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="person-section">
                            <h2>Languages</h2>

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