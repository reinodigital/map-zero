import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../accounting/account.module';
import { ClientsModule } from '../client/client.module';
import { ItemModule } from '../item/item.module';
import { SharedModule } from '../shared/shared.module';

import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceController } from './invoice.controller';
import { InvoiceActionsController } from './invoice-actions.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceItemService } from './invoice-item.service';
import { InvoiceActionsService } from './invoice-actions.service';

@Module({
  controllers: [InvoiceController, InvoiceActionsController],
  providers: [InvoiceService, InvoiceItemService, InvoiceActionsService],
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    AuthModule,
    AccountModule,
    ClientsModule,
    ItemModule,
    SharedModule,
  ],
  exports: [TypeOrmModule, InvoiceService],
})
export class InvoiceModule {}
