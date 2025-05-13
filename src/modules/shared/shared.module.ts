import { Module } from '@nestjs/common';

import { EmailTemplateService } from './services/email-template.service';
import { PrinterService } from './services/printer.service';
import { ReportService } from './services/report.service';
import { NodemailerService } from './services/nodemailer.service';

@Module({
  providers: [
    EmailTemplateService,
    PrinterService,
    ReportService,
    NodemailerService,
  ],
  imports: [],
  exports: [ReportService, NodemailerService],
})
export class SharedModule {}
