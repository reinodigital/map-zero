import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../accounting/account.module';
import { ClientsModule } from '../client/client.module';
import { ItemModule } from '../item/item.module';
import { SharedModule } from '../shared/shared.module';

import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderItemService } from './purchase-order-item.service';

@Module({
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, PurchaseOrderItemService],
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem]),
    AuthModule,
    AccountModule,
    ClientsModule,
    ItemModule,
    SharedModule,
  ],
  exports: [TypeOrmModule],
})
export class PurchaseOrderModule {}
