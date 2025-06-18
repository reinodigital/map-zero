import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ActivityModule } from '../economic-activities/activity.module';
import { CabysModule } from '../cabys/cabys.module';
import { TerritoryModule } from '../territory/territory.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, TerritoryModule, CabysModule, ActivityModule],
})
export class SeedModule {}
