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
import { InvoiceService } from './invoice.service';
import { InvoiceItemService } from './invoice-item.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceItemService],
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    AuthModule,
    AccountModule,
    ClientsModule,
    ItemModule,
    SharedModule,
  ],
  exports: [TypeOrmModule],
})
export class InvoiceModule {}
