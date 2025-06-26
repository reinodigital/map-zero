import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Quote } from 'src/modules/quote/entities/quote.entity';
import { PurchaseOrder } from 'src/modules/purchase-order/entities/purchase-order.entity';

import { PrinterService } from './printer.service';

import { quoteInvoicePDFReport } from '../reports/quote-invoice-pdf.report';
import { purchaseOrderInvoicePDFReport } from '../reports/purchase-order-invoice-pdf.report';

@Injectable()
export class ReportService {
  constructor(private readonly printerService: PrinterService) {}

  // QUOTE
  async generateQuotePDF(quote: Quote): Promise<PDFKit.PDFDocument> {
    try {
      const docDefinition = quoteInvoicePDFReport(quote);
      const doc = this.printerService.createPdf(docDefinition);

      return doc;
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }
  }

  // PURCHASE ORDER
  async generatePurchaseOrderPDF(
    purchaseOrder: PurchaseOrder,
  ): Promise<PDFKit.PDFDocument> {
    try {
      const docDefinition = purchaseOrderInvoicePDFReport(purchaseOrder);
      const doc = this.printerService.createPdf(docDefinition);

      return doc;
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }
  }

  private handleExceptionsErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at Report-Service: ${err}`,
    );
  }
}
