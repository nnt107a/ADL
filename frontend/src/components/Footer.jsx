import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

export default function Footer() {
  const { copy } = useLocale();
  const company = copy.footer.company;

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img className="brand-logo brand-logo-footer" src="/adl-logo.png" alt={copy.header.brandAlt} />
        </div>

        <div className="footer-links">
          {copy.navigation.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="footer-company">
          <p className="footer-company-name">{company.name}</p>
          <p className="footer-company-line">{company.license}</p>
          <p className="footer-company-line">{company.address}</p>
          <p className="footer-company-line">
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <p className="footer-company-line">
            <a href={`tel:${company.phone.replace(/\s+/g, '')}`}>{company.phone}</a>
          </p>
        </div>

        <p className="footer-note">{copy.footer.note}</p>
      </div>
    </footer>
  );
}
