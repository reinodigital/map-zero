import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { Quote } from 'src/modules/quote/entities/quote.entity';
import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';

import { quoteTotals } from './transformers/quote-totals';
import { formatDateAsReadable } from '../helpers/format-date-as-readable.helper';
import { CurrencyFormatter } from '../helpers/currency-formatter';
import { getTaxRateValue } from '../helpers/tax-rate';
import { footerSection } from './footer.report';

const logo: Content = {
  image: '/usr/src/app/seed-data/map_logo.png',
  width: 170,
  height: 170,
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
      fontSize: 12,
    },

    // Header
    // header: headerSection({ title: null }),

    pageMargins: [10, 0],
    pageSize: 'A4', // standard for receipt size
    content: [
      // header
      {
        margin: [0, 20, 0, 0],
        table: {
          widths: ['33%', '34%', '33%'], // Equal widths for 3 columns
          body: [
            [
              logo,
              {
                margin: [0, 50, 0, 0],
                alignment: 'center',
                stack: [
                  { text: 'MAP SOLUCIONES S.A', bold: true },
                  { text: 'Cédula Jurídica: 3-101-578509' },
                  { text: 'Teléfono: (+506) 4010-1111' },
                  { text: 'Guachipelín de Escazú' },
                  { text: 'San José, Costa Rica' },
                  { text: 'www.mapsoluciones.com' },
                ],
              },
              {
                margin: [0, 50, 0, 0],
                alignment: 'right',
                stack: [
                  { text: `Cotización`, bold: true, fontSize: 18 },
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
        layout: 'bordered',
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 30, 'auto', 'auto', 'auto'],
          body: [
            ['Descripción', 'Cant', 'Precio', 'Impuesto', `Monto ${currency}`],
            ...quoteItems.map((quoteItem: QuoteItem) => [
              quoteItem.description ?? '',
              quoteItem.quantity.toString(),
              CurrencyFormatter.formatPrice(quoteItem.price),
              `${getTaxRateValue(quoteItem.taxRate ?? '')}%`,
              CurrencyFormatter.formatPrice(
                quoteItem.price * quoteItem.quantity,
              ),
            ]),
          ],
        },
      },

      // subtotal, discount, IVA and total
      {
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
                  { text: 'Total', bold: true, marginTop: 8 },
                  {
                    text: `${currency} ${CurrencyFormatter.formatPrice(total)}`,
                    bold: true,
                    marginTop: 8,
                    alignment: 'right',
                  },
                ],
              ],
            },
          },
        ],
      },

      // signatures
      {
        margin: [0, 30, 0, 0],
        table: {
          widths: ['50%', '50%'],
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
                        x2: 250,
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                ],
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
                        x2: 250,
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                ],
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
