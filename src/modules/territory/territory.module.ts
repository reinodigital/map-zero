import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Province } from './entities/province.entity';
import { Canton } from './entities/canton.entity';
import { District } from './entities/district.entity';

import { TerritoryService } from './territory.service';
import { TerritoryController } from './territory.controller';

@Module({
  controllers: [TerritoryController],
  providers: [TerritoryService],
  imports: [TypeOrmModule.forFeature([Province, Canton, District]), AuthModule],
  exports: [TypeOrmModule, TerritoryService],
})
export class TerritoryModule {}
