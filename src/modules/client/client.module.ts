import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ClientsController } from './client.controller';
import { ClientAddressController } from './client-address.controller';
import { ClientContactController } from './client-contact.controller';
import { ClientsService } from './client.service';
import { ClientAddressService } from './client-address.service';
import { ClientContactService } from './client-contact.service';

import { Client } from './entities/client.entity';
import { ClientAddress } from './entities/client-address.entity';
import { ClientContact } from './entities/client-contact.entity';

@Module({
  controllers: [
    ClientsController,
    ClientAddressController,
    ClientContactController,
  ],
  providers: [ClientsService, ClientAddressService, ClientContactService],
  imports: [
    TypeOrmModule.forFeature([Client, ClientAddress, ClientContact]),
    AuthModule,
  ],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
