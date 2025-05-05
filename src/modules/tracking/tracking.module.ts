import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tracking } from './entities/tracking.entity';
import { TrackingService } from './tracking.service';

@Module({
  providers: [TrackingService],
  imports: [TypeOrmModule.forFeature([Tracking])],
  exports: [TypeOrmModule, TrackingService],
})
export class TrackingModule {}
