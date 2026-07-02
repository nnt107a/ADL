import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import navigation from '../data/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const closeOnResize = () => {
      if (window.innerWidth > 900) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnResize);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [location.pathname]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header" aria-label="Site header">
      <div className="container header-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="AD LEGAL home">
          <img className="brand-logo" src="/adl-logo.png" alt="AD LEGAL – Law, Finance & More" />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="site-nav"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="header-nav-wrap">
          <nav id="site-nav" className={`site-nav ${isOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            {navigation.map((item) => (
              <div className={`nav-item ${item.children ? 'nav-dropdown' : ''}`} key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'is-active nav-link' : 'nav-link')}
                >
                  {item.label}
                </NavLink>

                {item.children ? (
                  <div className="nav-submenu" aria-label={`${item.label} submenu`}>
                    {item.children.map((child) => (
                      <Link key={child.path} to={child.path} onClick={closeMenu}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="header-slogan-bar" aria-label="Site slogan">
        <div className="container">
          <div className="header-slogan">AD LEGAL – Law, Finance &amp; More</div>
        </div>
      </div>
    </header>
  );
}
