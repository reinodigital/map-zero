import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { quoteInvoicePDFReport } from '../reports/quote-invoice-pdf.report';
import { Quote } from 'src/modules/quote/entities/quote.entity';
import { PrinterService } from './printer.service';

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
