import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { quoteTotals } from './transformers/quote-totals';
import { Quote } from 'src/modules/quote/entities/quote.entity';
import { formatDateAsReadable } from '../helpers/format-date-as-readable.helper';
import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';
import { CurrencyFormatter } from '../helpers/currency-formatter';

const logo: Content = {
  image: '/usr/src/app/seed-data/map_logo.png',
  width: 90,
  height: 90,
  alignment: 'left',
  margin: [-2, 0, 0, 0],
};

// const currentDate: Content = {
//   text: DateFormatter.getDDMMMMYYYY(new Date()),
//   alignment: 'right',
//   margin: [0, 34, -250, 0],
//   bold: true,
//   width: 226,
// };

export const quoteInvoicePDFReport = (quote: Quote): TDocumentDefinitions => {
  const emptyField = 'no presenta';
  const {
    id,
    quoteNumber,
    status,
    total: totalToPay,
    initDate,
    expireDate = null,
    client,
    quoteItems,
  } = quote;

  const { iva, descuentos, subtotal, total } = quoteTotals(quoteItems);
  const clientAddress = client.addresses?.length
    ? `${client.addresses[0].provinceName}, ${client.addresses[0].cantonName}, ${client.addresses[0].districtName}`
    : 'no presenta';

  return {
    defaultStyle: {
      fontSize: 12,
    },

    // Header
    // header: headerSection({ title: null }),

    // footer
    // footer: footerSection,

    pageMargins: [10, 0],
    pageSize: 'A4', // standard for receipt size
    content: [
      // header
      {
        columns: [logo],
      },
      {
        columns: [
          {
            text: [
              { text: 'MAP SOLUCIONES S.A\n', bold: true },
              { text: 'Cédula Jurídica: 3-101-578509\n' },
              { text: 'Teléfono: (+506) 4010-1111\n' },
              { text: 'Guachipelín de Escazú\n' },
              { text: 'San José, Costa Rica\n' },
              { text: 'www.mapsoluciones.com\n' },
              // { text: 'Correo: info@mapsoluciones.com\n' },
            ],
            alignment: 'left',
          },
          {
            text: [
              {
                text: `Cotización\n`,
                style: { bold: true, fontSize: 18 },
              },
            ],
            alignment: 'right',
          },
        ],
      },

      // Client
      {
        columns: [
          {
            text: [
              {
                text: `Cliente: ${client.name}\n`,
                bold: true,
              },
              { text: `Identificación: ${client.identity}\n` },
              { text: `Teléfono: ${client.mobile}\n` },
              { text: `Dirección: ${clientAddress}\n` },
            ],
            alignment: 'left',
          },
          {
            text: [
              {
                text: `Fecha inicio: ${formatDateAsReadable(initDate!.toISOString())}\n`,
                bold: true,
              },
              {
                text: `Fecha vencimiento: ${expireDate ? formatDateAsReadable(expireDate.toISOString()) : ''}\n`,
                bold: true,
              },
            ],
            alignment: 'right',
          },
        ],
      },

      // Table of products
      {
        layout: 'bordered',
        margin: [0, 5],
        table: {
          headerRows: 1,
          widths: ['*', 30, 'auto', 'auto'],
          body: [
            ['Descripción', 'Cant', 'Precio', 'Impuesto'],
            ...quoteItems.map((quoteItem: QuoteItem) => [
              quoteItem.description ?? '',
              quoteItem.quantity.toString(),
              CurrencyFormatter.formatPrice(quoteItem.price),
              quoteItem.taxRate ?? '',
            ]),
          ],
        },
      },

      // subtotal, discount, IVA and total
      {
        columns: [
          {
            width: '*',
            text: '',
          },
          {
            width: 'auto',
            layout: 'noBorders',
            margin: [0, 5],
            table: {
              body: [
                [
                  'Subtotal',
                  {
                    text: `${CurrencyFormatter.formatPrice(subtotal)}`,
                    alignment: 'right',
                  },
                ],
                [
                  'Descuento',
                  {
                    text: `${CurrencyFormatter.formatPrice(descuentos)}`,
                    alignment: 'right',
                  },
                ],
                [
                  'IVA',
                  {
                    text: `${CurrencyFormatter.formatPrice(iva)}`,
                    alignment: 'right',
                  },
                ],
                [
                  { text: 'Total', bold: true },
                  {
                    text: `${CurrencyFormatter.formatPrice(total)}`,
                    bold: true,
                    alignment: 'right',
                  },
                ],
              ],
            },
          },
        ],
      },

      // footer // TODO: set here partner images logo
      {
        marginTop: 10,
        columns: [
          {
            text: [
              {
                text: `www.mapsoluciones.com`,
              },
            ],
            alignment: 'left',
          },
        ],
      },
    ],
  };
};
