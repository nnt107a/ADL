import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const benefits = [
  'Mentorship and practical learning',
  'Exposure to real client work',
  'Structured support and room to grow',
];

const roles = ['Advisor / Associate', 'Research & Knowledge Analyst', 'Client Services Coordinator'];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        kicker="Careers"
        title="Build your career with a team that values clarity and ownership."
        summary="ADL is a place for people who want meaningful work, direct feedback, and the chance to make a visible impact on clients and projects."
      />

      <section className="section section-dark reveal">
        <div className="container careers-grid">
          <div className="careers-copy">
            <p className="section-kicker section-kicker-dark">Why join</p>
            <h2>Join a team that moves with purpose.</h2>
            <p>
              You will work with people who care about quality, communicate directly, and build
              practical solutions together.
            </p>
            <ul className="career-benefits">
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <article className="career-card">
            <p className="content-label">Open opportunities</p>
            <h3>Roles we are ready to talk about.</h3>
            <ul className="role-list">
              {roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
            <Link className="button button-primary" to="/contact">
              Send your CV
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
