import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Item } from './entities/item.entity';

import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../accounting/account.module';
import { CabysModule } from '../cabys/cabys.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    AuthModule,
    AccountModule,
    CabysModule,
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [TypeOrmModule],
})
export class ItemModule {}
