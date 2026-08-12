const encodeAssetPath = (path) => encodeURI(path);

const darkBackdropHeader = {
  kickerColor: '#F8E3A2',
  titleColor: '#FFFFFF',
  summaryColor: 'rgba(255, 255, 255, 0.84)',
};

const lightBackdropHeader = {
  kickerColor: '#006797',
  titleColor: '#0C2839',
  summaryColor: '#2E4758',
};

export const homePartnerLogos = [
  { src: encodeAssetPath('/partner_logo/logo 80.png'), alt: 'Partner logo 80' },
  { src: encodeAssetPath('/partner_logo/logo D&H.png'), alt: 'Partner logo D&H' },
  { src: encodeAssetPath('/partner_logo/logo ecvn.png'), alt: 'Partner logo ECVN' },
  { src: encodeAssetPath('/partner_logo/logo front.png'), alt: 'Partner logo Front' },
  { src: encodeAssetPath('/partner_logo/logo global.webp'), alt: 'Partner logo Global' },
  { src: encodeAssetPath('/partner_logo/logo immeta.png'), alt: 'Partner logo Immeta' },
  { src: encodeAssetPath('/partner_logo/logo intec.png'), alt: 'Partner logo Intec' },
  { src: encodeAssetPath('/partner_logo/logo neoen.png'), alt: 'Partner logo Neoen' },
  { src: encodeAssetPath('/partner_logo/logo quang vinh.webp'), alt: 'Partner logo Quang Vinh' },
  { src: encodeAssetPath('/partner_logo/logo sml.png'), alt: 'Partner logo SML' },
];

export const pageBackdrops = {
  about: encodeAssetPath('/page_bg/Trang About us.webp'),
  services: encodeAssetPath('/page_bg/Trang Our Services.webp'),
  people: encodeAssetPath('/page_bg/Trang Our People.webp'),
  insight: encodeAssetPath('/page_bg/Trang Insight.webp'),
  news: encodeAssetPath('/page_bg/Trang News.webp'),
  contact: encodeAssetPath('/page_bg/Trang Contact.webp'),
  mission: encodeAssetPath('/page_bg/Lantern.webp'),
  vision: encodeAssetPath('/page_bg/Lantern.webp'),
};

export const pageHeaderThemes = {
  about: lightBackdropHeader,
  services: lightBackdropHeader,
  people: lightBackdropHeader,
  insight: darkBackdropHeader,
  news: lightBackdropHeader,
  contact: lightBackdropHeader,
  mission: lightBackdropHeader,
  vision: lightBackdropHeader,
};

export const serviceBackdrops = {
  'foreign-investment': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'mergers-acquisitions-restructuring': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'capital-markets-finance-banking': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'real-estate-construction': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  tax: encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'employment-labor': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'corporate-governance-retainer': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'intellectual-property': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'personal-data-protection': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
  'dispute-resolution': encodeAssetPath('/page_bg/Trang Intellectual Property.webp'),
};

export const serviceHeaderThemes = {
  'foreign-investment': lightBackdropHeader,
  'mergers-acquisitions-restructuring': darkBackdropHeader,
  'capital-markets-finance-banking': darkBackdropHeader,
  'real-estate-construction': darkBackdropHeader,
  tax: darkBackdropHeader,
  'employment-labor': lightBackdropHeader,
  'corporate-governance-retainer': lightBackdropHeader,
  'intellectual-property': darkBackdropHeader,
  'personal-data-protection': darkBackdropHeader,
  'dispute-resolution': darkBackdropHeader,
};
