import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdownPath, setOpenDropdownPath] = useState('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const location = useLocation();
  const { copy, locale, setLocale } = useLocale();

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdownPath('');
    setIsLanguageMenuOpen(false);

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setOpenDropdownPath('');
        setIsLanguageMenuOpen(false);
      }
    };

    const closeOnResize = () => {
      if (window.innerWidth > 900) {
        setIsOpen(false);
        setOpenDropdownPath('');
        setIsLanguageMenuOpen(false);
      }
    };

    const closeOnPointerDown = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnResize);
    document.addEventListener('pointerdown', closeOnPointerDown);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnResize);
      document.removeEventListener('pointerdown', closeOnPointerDown);
    };
  }, [location.pathname]);

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdownPath('');
    setIsLanguageMenuOpen(false);
  };

  const selectLocale = (nextLocale) => {
    setLocale(nextLocale);
    setIsLanguageMenuOpen(false);
  };

  return (
    <header className="site-header" aria-label="Site header">
      <div className="container header-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="AD LEGAL home">
          <img className="brand-logo" src="/adl-logo.png" alt={copy.header.brandAlt} />
        </Link>

        <div className="header-nav-wrap">
          <button
            className="menu-toggle"
            type="button"
            aria-label={isOpen ? copy.ui.closeNavigationMenu : copy.ui.openNavigationMenu}
            aria-expanded={isOpen}
            aria-controls="site-nav"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav id="site-nav" className={`site-nav ${isOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            {copy.navigation.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isDropdownOpen = openDropdownPath === item.path;

              return (
                <div
                  className={`nav-item ${hasChildren ? 'nav-dropdown' : ''} ${isDropdownOpen ? 'is-open' : ''}`}
                  key={item.path}
                  onMouseEnter={() => {
                    if (hasChildren) {
                      setOpenDropdownPath(item.path);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasChildren) {
                      setOpenDropdownPath('');
                    }
                  }}
                  onFocus={() => {
                    if (hasChildren) {
                      setOpenDropdownPath(item.path);
                    }
                  }}
                  onBlur={(event) => {
                    if (hasChildren && !event.currentTarget.contains(event.relatedTarget)) {
                      setOpenDropdownPath('');
                    }
                  }}
                >
                  <NavLink
                    to={item.path}
                    end
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? 'is-active nav-link' : 'nav-link')}
                  >
                    {item.label}
                  </NavLink>

                  {item.path === '/contact' ? (
                    <div
                      ref={languageMenuRef}
                      className={`nav-language ${isLanguageMenuOpen ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="nav-language-toggle"
                        aria-label={copy.ui.language}
                        aria-haspopup="menu"
                        aria-expanded={isLanguageMenuOpen}
                        onClick={() => setIsLanguageMenuOpen((current) => !current)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="nav-language-icon"
                          aria-hidden="true"
                        >
                          <path d="M12 3.2a8.8 8.8 0 1 1-6.2 2.6A8.76 8.76 0 0 1 12 3.2Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
                          <path d="M6.1 6.3c1.3.7 2.4 1.8 3.2 3.1.8 1.3 1.3 2.9 1.4 4.8.1 1.9-.2 3.6-.9 5" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M17.9 6.3c-1.3.7-2.4 1.8-3.2 3.1-.8 1.3-1.3 2.9-1.4 4.8-.1 1.9.2 3.6.9 5" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M4.7 12h14.6" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M12 3.2c-2.2 2.2-3.2 4.9-3.2 8.8s1 6.6 3.2 8.8" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M12 3.2c2.2 2.2 3.2 4.9 3.2 8.8s-1 6.6-3.2 8.8" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M2.8 5.2h6.3v6.3H7.4l-.8 1.2-.9-1.2H2.8z" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
                          <path d="M17.7 12.5h3.5v5h-2.1l-.8 1.1-.8-1.1h-2.1v-5z" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
                          <path d="M4.4 7.4h1.9" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M19.6 14.7h-1.9" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
                          <path d="M4.2 6.6h1.1v1.1" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 17.5v-1.1h1.1" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8.1 8.2l.4-1 .4 1 .9.1-.7.6.2 1-.8-.6-.8.6.2-1-.7-.6z" fill="currentColor" />
                          <path d="M15.7 14.8l.4-1 .4 1 .9.1-.7.6.2 1-.8-.6-.8.6.2-1-.7-.6z" fill="currentColor" />
                        </svg>
                      </button>

                      <div className="nav-language-menu" role="menu" aria-label={copy.ui.language}>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={locale === 'en'}
                          className={locale === 'en' ? 'nav-language-option is-active' : 'nav-language-option'}
                          onClick={() => selectLocale('en')}
                        >
                          {copy.ui.english}
                        </button>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={locale === 'vi'}
                          className={locale === 'vi' ? 'nav-language-option is-active' : 'nav-language-option'}
                          onClick={() => selectLocale('vi')}
                        >
                          {copy.ui.vietnamese}
                        </button>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={locale === 'cn'}
                          className={locale === 'cn' ? 'nav-language-option is-active' : 'nav-language-option'}
                          onClick={() => selectLocale('cn')}
                        >
                          {copy.ui.chinese}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {hasChildren ? (
                    <div className={`nav-submenu ${item.submenuClassName || ''}`} aria-label={`${item.label} submenu`}>
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path} onClick={closeMenu}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="header-slogan-bar" aria-label="Site slogan">
        <div className="container">
          <div className="header-slogan">{copy.header.slogan}</div>
        </div>
      </div>
    </header>
  );
}
