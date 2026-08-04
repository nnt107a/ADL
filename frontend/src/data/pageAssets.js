const encodeAssetPath = (path) => encodeURI(path);

export const homePartnerLogos = [
  { src: encodeAssetPath('/partner_logo/logo 80.png'), alt: 'Partner logo 80' },
  { src: encodeAssetPath('/partner_logo/logo D&H.png'), alt: 'Partner logo D&H' },
  { src: encodeAssetPath('/partner_logo/logo ecvn.png'), alt: 'Partner logo ECVN' },
  { src: encodeAssetPath('/partner_logo/logo front.png'), alt: 'Partner logo Front' },
  { src: encodeAssetPath('/partner_logo/logo global.jpg'), alt: 'Partner logo Global' },
  { src: encodeAssetPath('/partner_logo/logo immeta.png'), alt: 'Partner logo Immeta' },
  { src: encodeAssetPath('/partner_logo/logo intec.png'), alt: 'Partner logo Intec' },
  { src: encodeAssetPath('/partner_logo/logo neoen.png'), alt: 'Partner logo Neoen' },
  { src: encodeAssetPath('/partner_logo/logo quang vinh.jpg'), alt: 'Partner logo Quang Vinh' },
  { src: encodeAssetPath('/partner_logo/logo sml.png'), alt: 'Partner logo SML' },
];

export const pageBackdrops = {
  about: encodeAssetPath('/page_bg/Trang About us.jpg'),
  services: encodeAssetPath('/page_bg/Trang Our Services.jpg'),
  people: encodeAssetPath('/page_bg/Trang Our People.jpg'),
  insight: encodeAssetPath('/page_bg/Trang Insight.jpg'),
  news: encodeAssetPath('/page_bg/Trang News.jpg'),
  contact: encodeAssetPath('/page_bg/Trang Contact.jpg'),
  mission: encodeAssetPath('/page_bg/Trang Mission.jpg'),
  vision: encodeAssetPath('/page_bg/Trang Vision.jpg'),
};

export const serviceBackdrops = {
  'foreign-investment': encodeAssetPath('/page_bg/Trang Foreign Investment.jpg'),
  'mergers-acquisitions-restructuring': encodeAssetPath('/page_bg/Trang M&A, Corporate Structuring.jpg'),
  'capital-markets-finance-banking': encodeAssetPath('/page_bg/Trang Capital Market.jpg'),
  'real-estate-construction': encodeAssetPath('/page_bg/Trang Real Estate.jpg'),
  tax: encodeAssetPath('/page_bg/Trang Tax.jpg'),
  'employment-labor': encodeAssetPath('/page_bg/Trang Employment.jpg'),
  'corporate-governance-retainer': encodeAssetPath('/page_bg/Trang Corporate Governance.jpg'),
  'intellectual-property': encodeAssetPath('/page_bg/Trang Intellectual Property.jpg'),
  'personal-data-protection': encodeAssetPath('/page_bg/Trang Personal Data Protection.jpg'),
  'dispute-resolution': encodeAssetPath('/page_bg/Trang Dispute Resolution.jpg'),
};
