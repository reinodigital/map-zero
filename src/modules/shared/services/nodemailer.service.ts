import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

import { Quote } from 'src/modules/quote/entities/quote.entity';
import { EmailTemplateService } from './email-template.service';
import { ReportService } from './report.service';

import { EmailQuoteDto } from 'src/modules/quote/dto/create-quote.dto';

@Injectable()
export class NodemailerService {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private reportService: ReportService,
  ) {}

  // Quotation
  async sendQuoteEmail(quote: Quote, dataEmail: EmailQuoteDto): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email provider
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Compile the email template with order data
    const emailHtml = this.emailTemplateService.compileTemplate(
      'quote-email-template',
      {
        documentName: 'Cotización',
        clientName: quote.client.name,
        quoteNumber: quote.quoteNumber,
      },
    );

    // Build PDF attachment
    const doc = await this.reportService.generateQuotePDF(quote);

    // converts doc (stream) to a buffer array
    const pdfFileToBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk)); // Collect chunks
      doc.on('end', () => resolve(Buffer.concat(chunks))); // Merge chunks into a single Buffer
      doc.on('error', (err) => reject(err)); // Handle errors

      doc.end(); // Finalize the document
    });

    // Email options
    // changeMe!
    const mailOptions = {
      from: '"MAP Soluciones" <onier0217@gmail.com>',
      to: dataEmail.emails[0],
      subject: dataEmail.subject ?? 'Cotización',
      html: emailHtml,
      attachments: [
        {
          filename: 'logo.png',
          path: '/usr/src/app/seed-data/map_logo.png', // Path to the static logo image
          cid: 'logo', // Same CID as in the template
        },
        {
          filename: `Cotización_${quote.quoteNumber}.pdf`, // PDF File
          content: pdfFileToBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  }
}
