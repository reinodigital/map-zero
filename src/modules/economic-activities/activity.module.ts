import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityController } from './activity.controller';
import { Activity } from './entities/activity.entity';
import { ActivityService } from './activity.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  imports: [TypeOrmModule.forFeature([Activity])],
  exports: [TypeOrmModule, ActivityService],
})
export class ActivityModule {}
