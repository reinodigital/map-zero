import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { TrackingModule } from '../tracking/tracking.module';
import { SharedController } from './shared.controller';

import { EmailTemplateService } from './services/email-template.service';
import { PrinterService } from './services/printer.service';
import { ReportService } from './services/report.service';
import { NodemailerService } from './services/nodemailer.service';
import { SharedService } from './services/shared.service';

@Module({
  imports: [TrackingModule, AuthModule],
  controllers: [SharedController],
  providers: [
    EmailTemplateService,
    PrinterService,
    ReportService,
    NodemailerService,
    SharedService,
  ],
  exports: [ReportService, NodemailerService],
})
export class SharedModule {}
