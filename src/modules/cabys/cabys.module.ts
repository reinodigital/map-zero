import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CabysList } from './entities/cabys-list.entity';
import { CabysController } from './cabys.controller';
import { CabysService } from './cabys.service';

@Module({
  controllers: [CabysController],
  providers: [CabysService],
  imports: [TypeOrmModule.forFeature([CabysList])],
  exports: [TypeOrmModule, CabysService],
})
export class CabysModule {}
