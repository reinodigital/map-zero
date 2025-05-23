import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { Quote } from 'src/modules/quote/entities/quote.entity';
import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';

import { quoteTotals } from './transformers/quote-totals';
import { formatDateAsReadable } from '../helpers/format-date-as-readable.helper';
import { CurrencyFormatter } from '../helpers/currency-formatter';
import { getTaxRateValue } from '../helpers/tax-rate';
import { footerSection } from './footer.report';
import { rowDividerLayout } from './layouts/table-row-divider.layout';

const logo: Content = {
  image: '/usr/src/app/seed-data/map_logo.png',
  width: 170,
  height: 80,
  alignment: 'left',
};
const circle: Content = {
  image: '/usr/src/app/seed-data/map_circle.png',
  width: 65,
  height: 65,
  alignment: 'center',
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
    status,
    quoteNumber,
    currency,
    total: totalToPay,
    initDate,
    expireDate = null,
    client,
    quoteItems,
    terms = '',
  } = quote;

  const readableInitDate = formatDateAsReadable(initDate!.toISOString(), false);
  const readableExpireDate = formatDateAsReadable(
    expireDate?.toISOString() ?? '',
    false,
  );

  const { iva, descuentos, subtotal, total } = quoteTotals(quoteItems);
  const clientAddress = client.addresses?.length
    ? `${client.addresses[0].provinceName}, ${client.addresses[0].cantonName}, ${client.addresses[0].districtName}`
    : 'no presenta';

  return {
    defaultStyle: {
      fontSize: 10,
    },

    // Header
    // header: headerSection({ title: null }),

    // pageMargins: [10, 10],
    pageSize: 'A4', // standard for receipt size
    content: [
      // header
      {
        table: {
          widths: ['33%', '34%', '33%'], // Equal widths for 3 columns
          body: [
            [
              logo,
              {
                // margin: [0, 50, 0, 0],
                alignment: 'center',
                stack: [
                  {
                    text: 'MAP SOLUCIONES S.A',
                    bold: true,
                    fontSize: 12,
                    marginBottom: 2,
                  },
                  {
                    text: 'Cédula Jurídica: 3-101-578509',
                    bold: true,
                    fontSize: 11,
                    marginBottom: 2,
                  },
                  { text: 'Teléfono: (+506) 4010-1111', marginBottom: 2 },
                  { text: 'Guachipelín de Escazú', marginBottom: 2 },
                  { text: 'San José, Costa Rica', marginBottom: 2 },
                  { text: 'www.mapsoluciones.com', marginBottom: 2 },
                ],
              },
              {
                // margin: [0, 50, 0, 0],
                alignment: 'right',
                stack: [
                  { text: `Cotización`, bold: true, fontSize: 20 },
                  { text: `No. ${quoteNumber}`, bold: true, fontSize: 14 },
                ],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      // Client
      {
        margin: [0, 20, 0, 0],
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
                text: `Fecha inicio: ${readableInitDate}\n`,
                bold: true,
              },
              {
                text: `Fecha vencimiento: ${expireDate ? readableExpireDate : ''}\n`,
                bold: true,
              },
            ],
            alignment: 'right',
          },
        ],
      },

      // Table of products
      {
        // layout: 'bordered',
        layout: rowDividerLayout,
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 30, 'auto', 60, 'auto'],
          body: [
            [
              { text: 'Descripción', bold: true },
              { text: 'Cant', bold: true, alignment: 'center' },
              { text: 'Precio', bold: true, alignment: 'center' },
              { text: 'Impuesto', bold: true, alignment: 'center' },
              { text: `Monto ${currency}`, bold: true },
            ],
            ...quoteItems.map((quoteItem: QuoteItem) => [
              { text: quoteItem.description ?? '' },
              { text: quoteItem.quantity.toString(), alignment: 'center' },
              {
                text: CurrencyFormatter.formatPrice(quoteItem.price),
                alignment: 'center',
              },
              {
                text: `${getTaxRateValue(quoteItem.taxRate ?? '')}%`,
                alignment: 'center',
              },
              {
                text: CurrencyFormatter.formatPrice(
                  quoteItem.price * quoteItem.quantity,
                ),
                alignment: 'right',
              },
            ]),
          ],
        },
      },

      // subtotal, discount, IVA and total
      {
        margin: [0, 10, 0, 0],
        columns: [
          {
            width: 250,
            marginTop: 10,
            fontSize: 10,
            text: `Términos: ${terms}`,
          },
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
                  { text: 'Subtotal', marginRight: 38, alignment: 'left' },
                  {
                    text: `${CurrencyFormatter.formatPrice(subtotal)}`,
                    alignment: 'right',
                    marginRight: 4,
                  },
                ],
                [
                  'Descuento',
                  {
                    text: `${CurrencyFormatter.formatPrice(descuentos)}`,
                    alignment: 'right',
                    marginRight: 4,
                  },
                ],
                [
                  'IVA',
                  {
                    text: `${CurrencyFormatter.formatPrice(iva)}`,
                    alignment: 'right',
                    marginRight: 4,
                  },
                ],
                [
                  { text: 'Total', bold: true, marginTop: 8, fontSize: 13 },
                  {
                    text: `${currency} ${CurrencyFormatter.formatPrice(total)}`,
                    bold: true,
                    marginTop: 8,
                    fontSize: 13,
                    alignment: 'right',
                    marginRight: 4,
                  },
                ],
              ],
            },
          },
        ],
      },

      // signatures
      {
        table: {
          widths: ['*', 80, '*'],
          body: [
            [
              {
                stack: [
                  { text: 'Firma cliente', margin: [0, 0, 0, 4] },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 180, // Example: Adjust this value as needed for desired line length
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                ],
                alignment: 'left',
                marginTop: 50,
              },
              {
                stack: [circle],
                alignment: 'left',
                marginRight: 20,
              },
              {
                stack: [
                  { text: 'No. identificación', margin: [0, 0, 0, 4] },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 200, // Example: Adjust this value as needed
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                ],
                alignment: 'left',
                marginTop: 50,
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      // partner logos
      footerSection(),
    ],
  };
};
