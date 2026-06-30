import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import services from "../data/services.json";

export default function CapabilityDetailPage() {
    const { id } = useParams();

    const service = services.find((s) => s.id === id);

    if (!service) {
        return (
            <section className="section">
                <div className="container">
                    <h2>Service not found.</h2>
                </div>
            </section>
        );
    }

    return (
        <>
            <PageHeader
                kicker="Services"
                title={service.title}
                summary={service.shortDescription}
            >
                <Link className="back-link" to="/services">
                    ← Back to Services
                </Link>
            </PageHeader>

            <section className="section section-light">
                <div className="container service-detail">

                    <section className="service-section">
                        <h2>Overview</h2>

                        {service.overview.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </section>

                    <section className="service-section">
                        <h2>Representative Services</h2>

                        <ul className="service-list">
                            {service.services.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="service-section">
                        <h2>Representative Projects</h2>

                        <div className="project-list">
                            {service.representativeProjects.map((project, index) => (
                                <div
                                    className="project-item"
                                    key={project}
                                >
                                    <span className="project-number">
                                        {(index + 1)
                                            .toString()
                                            .padStart(2, "0")}
                                    </span>

                                    <p>{project}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </section>
        </>
    );
}