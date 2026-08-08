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
    targets.forEach((target) => target.classList.add('is-visible'));

    const t1 = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }, 100);
    const t2 = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
