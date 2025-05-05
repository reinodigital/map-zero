import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Item } from './entities/item.entity';

import { AuthModule } from '../auth/auth.module';
import { CabysModule } from '../cabys/cabys.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), AuthModule, CabysModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
