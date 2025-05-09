import { Content } from 'pdfmake/interfaces';

const logo: Content = {
  image: '/usr/src/app/seed-data/map_logo.png',
  width: 50,
  height: 50,
  alignment: 'left',
  margin: [5, 0, 0, 5],
};

interface HeaderOptions {
  title?: string;
  subTitle?: string;
  showLogo?: boolean;
  showDate?: boolean;
}

export const headerSection = (options: HeaderOptions): any => {
  const {
    title = '',
    subTitle = '',
    showLogo = true,
    showDate = false,
  } = options;

  const headerLogo: Content = logo;
  const headerTitle: Content = buildHeaderTitle(title, subTitle);
  // const headerDate: Content = showDate ? currentDate : null;
  const headerDate: Content | null = null;

  return {
    columns: [headerLogo, headerTitle, headerDate],
  };
};

const buildHeaderTitle = (title: string, subtitle: string): Content => {
  const titleContent: Content = {
    stack: [
      {
        text: title,
        alignment: 'center',
        margin: [0, 10, 0, 0],
        style: {
          bold: true,
          fontSize: 22,
        },
      },

      buildHeaderSubtitle(subtitle),
    ],
  };

  return titleContent;
};

const buildHeaderSubtitle = (subtitle: string): Content => {
  return {
    text: subtitle,
    alignment: 'center',
    margin: [0, 2, 0, 0],
    style: {
      bold: true,
      fontSize: 16,
    },
  };
};
