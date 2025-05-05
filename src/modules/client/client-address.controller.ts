import { Controller, Post, Body, Param, Delete } from '@nestjs/common';

import { AuthDecorator, GetUser } from '../auth/decorators';
import { ClientAddressService } from './client-address.service';

import { CreateClientAddressDto } from './dto/create-client-address.dto';
import { RemoveClientContactAddressDto } from './dto/remove-client-contact-address.dto';
import { ListDataUser } from 'src/enums';

@Controller('client-address')
export class ClientAddressController {
  constructor(private readonly clientAddressService: ClientAddressService) {}

  // NEW ADDRESS
  @Post('new-one/:clientId')
  @AuthDecorator()
  createAddress(
    @Param('clientId') clientId: string,
    @Body() createClientAddressDto: CreateClientAddressDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientAddressService.createNewOne(
      +clientId,
      createClientAddressDto,
      userName,
    );
  }

  // FIND ALL BY CLIENT-ID - PUBLIC ENDPOINT
  // @Get('/:clientId')
  // findAll(@Param('clientId') clientId: string) {
  //   return this.clientAddressService.findAllByClientID(+clientId);
  // }

  @Delete('/:addressId')
  @AuthDecorator()
  removeOne(
    @Param('addressId') addressId: string,
    @Body() removeClientContactAddressDto: RemoveClientContactAddressDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientAddressService.remove(
      +addressId,
      removeClientContactAddressDto,
      userName,
    );
  }
}
