import { Content } from 'pdfmake/interfaces';

const microsoftPartner: Content = {
  image: '/usr/src/app/seed-data/microsoft_partner.png',
  width: 150,
  height: 60,
  alignment: 'left',
  margin: [-2, 0, 0, 0],
};
const dellPartner: Content = {
  image: '/usr/src/app/seed-data/dell_partner.png',
  width: 150,
  height: 60,
  margin: [-2, 0, 0, 0],
};
const lenovoPartner: Content = {
  image: '/usr/src/app/seed-data/lenovo_partner.jpg',
  width: 150,
  height: 60,
  margin: [-2, 0, 0, 0],
};
// const carbonitePartner: Content = {
//   image: '/usr/src/app/seed-data/carbonite_partner.jpg',
//   width: 140,
//   height: 60,
//   margin: [-2, 0, 0, 0],
// };

export const footerSection = (
  currentPage?: number,
  pageCount?: number,
): Content => {
  return {
    margin: [0, 30, 0, 0],
    table: {
      widths: ['33.33%', '33.33%', '33.33%'], // Equal widths for 4 columns
      body: [[dellPartner, microsoftPartner, lenovoPartner]],
    },
    layout: 'noBorders',
  };
};
