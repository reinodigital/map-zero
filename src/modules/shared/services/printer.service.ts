import { Injectable } from '@nestjs/common';
// import PdfPrinter from 'pdfmake';
const PdfPrinter = require('pdfmake');

import {
  BufferOptions,
  CustomTableLayout,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: '/usr/src/app/seed-data/fonts/Roboto-Regular.ttf',
    bold: '/usr/src/app/seed-data/fonts/Roboto-Bold.ttf',
    italics: '/usr/src/app/seed-data/fonts/Roboto-Italic.ttf',
    bolditalics: '/usr/src/app/seed-data/fonts/Roboto-MediumItalic.ttf',
  },
};

const customTableLayouts: Record<string, CustomTableLayout> = {
  customLayout01: {
    hLineWidth: function (i, node) {
      if (i === 0 || i === node.table.body.length) {
        return 0;
      }
      return i === node.table.headerRows ? 2 : 1;
    },
    vLineWidth: function (i) {
      return 0;
    },
    hLineColor: function (i) {
      return i === 1 ? 'black' : '#aaa';
    },
    paddingLeft: function (i) {
      return i === 0 ? 0 : 8;
    },
    paddingRight: function (i, node) {
      return i === node?.table?.widths?.length! - 1 ? 0 : 8;
    },
    fillColor: function (i, node) {
      if (i === 0) {
        return '#00b4d8';
      }

      // if (i === node.table.body.length - 1) {
      //     return '#90e0ef';
      // }

      return i % 2 === 0 ? '#e5e5e5' : null;
    },
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  createPdf(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {
      tableLayouts: customTableLayouts,
    },
  ): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinition, options);
  }
}
