import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingContactWidgets from './FloatingContactWidgets';
import { useLocale } from '../context/LocaleContext';

export default function Layout() {
  const location = useLocation();
  const { copy } = useLocale();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('.reveal'));

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {copy.ui.skipToContent}
      </a>
      <Header />
      <main id="main-content" className="site-main">
        <Outlet />
      </main>
      <Footer />
      <FloatingContactWidgets />
    </div>
  );
}
