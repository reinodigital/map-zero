import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Client } from './entities/client.entity';
import { ClientsController } from './client.controller';
import { ClientsService } from './client.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [TypeOrmModule.forFeature([Client]), AuthModule],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
