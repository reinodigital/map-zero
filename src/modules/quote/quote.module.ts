import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../client/client.module';
import { ItemModule } from '../item/item.module';
import { SharedModule } from '../shared/shared.module';

import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService],
  imports: [
    TypeOrmModule.forFeature([Quote, QuoteItem]),
    AuthModule,
    ClientsModule,
    ItemModule,
    SharedModule,
  ],
  exports: [TypeOrmModule],
})
export class QuoteModule {}
