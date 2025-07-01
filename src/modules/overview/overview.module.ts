import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Quote } from '../quote/entities/quote.entity';
import { Invoice } from '../invoice/entities/invoice.entity';

import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';

@Module({
  controllers: [OverviewController],
  providers: [OverviewService],
  imports: [TypeOrmModule.forFeature([Quote, Invoice]), AuthModule],
})
export class OverviewModule {}
