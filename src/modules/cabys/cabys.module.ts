import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CabysList } from './entities/cabys-list.entity';
import { CabysService } from './cabys.service';

@Module({
  providers: [CabysService],
  imports: [TypeOrmModule.forFeature([CabysList])],
  exports: [TypeOrmModule, CabysService],
})
export class CabysModule {}
