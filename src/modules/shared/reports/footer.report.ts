import { Content } from 'pdfmake/interfaces';

export const footerSection = (
  currentPage: number,
  pageCount: number,
): Content => {
  return {
    columns: [
      {
        text: [
          {
            text: `Un gusto atenderles !!\n`,
            style: { fontSize: 10 },
            margin: [10, 10, 0, 15],
          },
        ],
        alignment: 'left',
        marginLeft: 10,
      },
      {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'right',
        margin: [0, 10, 10, 5],
        fontSize: 10,
        bold: true,
      },
    ],
  };
};
