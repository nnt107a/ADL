import { Link } from 'react-router-dom';
import navigation from '../data/navigation';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img className="brand-logo brand-logo-footer" src="/adl-logo.png" alt="AD LEGAL – Law, Finance & More" />
        </div>

        <div className="footer-links">
          {navigation.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>

        <p className="footer-note">© 2026 ADL. All rights reserved.</p>
      </div>
    </footer>
  );
}
