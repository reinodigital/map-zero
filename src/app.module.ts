import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigDB } from './db/config';

import { AuthModule } from './modules/auth/auth.module';
import { ActivityModule } from './modules/economic-activities/activity.module';
import { AccountModule } from './modules/accounting/account.module';
import { CabysModule } from './modules/cabys/cabys.module';
import { ClientsModule } from './modules/client/client.module';
import { ItemModule } from './modules/item/item.module';
import { QuoteModule } from './modules/quote/quote.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { SeedModule } from './modules/seed/seed.module';
import { SharedModule } from './modules/shared/shared.module';
import { TerritoryModule } from './modules/territory/territory.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { OverviewModule } from './modules/overview/overview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // to make ConfigModule available globally
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public'),
    }),

    // TypeOrmConfig
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return ConfigDB.getTypeOrmOptions(configService);
      },
      // This imports allow the typeOrm connect with Mysql and use .env without errors
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    AuthModule,
    AccountModule,
    ActivityModule,
    CabysModule,
    ClientsModule,
    ItemModule,
    QuoteModule,
    PurchaseOrderModule,
    InvoiceModule,
    SeedModule,
    SharedModule,
    TerritoryModule,
    TrackingModule,
    OverviewModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
