import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ClientsController } from './client.controller';
import { ClientAddressController } from './client-address.controller';
import { ClientsService } from './client.service';
import { ClientAddressService } from './client-address.service';

import { Client } from './entities/client.entity';
import { ClientAddress } from './entities/client-address.entity';

@Module({
  controllers: [ClientsController, ClientAddressController],
  providers: [ClientsService, ClientAddressService],
  imports: [TypeOrmModule.forFeature([Client, ClientAddress]), AuthModule],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
