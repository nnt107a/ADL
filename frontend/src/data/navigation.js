import services from './services.json';

const navigation = [
  {
    label: 'About Us',
    path: '/about',
    children: [
      { label: 'News', path: '/news' },
      { label: 'Mission', path: '/mission' },
      { label: 'Vision', path: '/vision' },
    ],
  },
  { label: 'Our People', path: '/people' },
  {
    label: 'Our Services',
    path: '/services',
    submenuClassName: 'nav-submenu-services',
    children: services.map((service) => ({
      label: service.title,
      path: `/services/${service.id}`,
    })),
  },
  { label: 'Insight', path: '/insight' },
  { label: 'Contact', path: '/contact' },
];

export default navigation;
