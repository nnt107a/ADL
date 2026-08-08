import { useLocale } from '../context/LocaleContext';

function normalizeDigits(phone) {
  return phone.replace(/[^\d]/g, '');
}

function normalizeTel(phone) {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export default function FloatingContactWidgets() {
  const { copy } = useLocale();
  const phone = copy.footer.company.phone;
  const digits = normalizeDigits(phone);

  const links = [
    {
      label: 'Phone',
      icon: '/icons/phone.png',
      href: normalizeTel(phone),
      external: false,
      className: 'floating-contact-widget--phone',
    },
    {
      label: 'Zalo',
      icon: '/icons/zalo.png',
      href: `https://zalo.me/${digits}`,
      external: true,
      className: 'floating-contact-widget--zalo',
    },
    {
      label: 'WhatsApp',
      icon: '/icons/whatsapp.png',
      href: `https://wa.me/${digits}`,
      external: true,
      className: 'floating-contact-widget--whatsapp',
    },
  ];

  return (
    <aside className="floating-contact-widgets" aria-label="Quick contact links">
      {links.map((link) => (
        <a
          key={link.label}
          className={`floating-contact-widget floating-contact-widget--icon-only ${link.className}`}
          href={link.href}
          aria-label={link.label}
          {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          <img className="floating-contact-widget__icon" src={link.icon} alt="" aria-hidden="true" />
        </a>
      ))}
    </aside>
  );
}
