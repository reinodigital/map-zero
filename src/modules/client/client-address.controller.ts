import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';

import { AuthDecorator } from '../auth/decorators';
import { ClientAddressService } from './client-address.service';

import { CreateClientAddressDto } from './dto/create-client-address.dto';

@Controller('client-address')
export class ClientAddressController {
  constructor(private readonly clientAddressService: ClientAddressService) {}

  // NEW ADDRESS
  @Post('new-one/:clientId')
  @AuthDecorator()
  createAddress(
    @Param('clientId') clientId: string,
    @Body() createClientAddressDto: CreateClientAddressDto,
  ) {
    return this.clientAddressService.createNewOne(
      +clientId,
      createClientAddressDto,
    );
  }

  // FIND ALL BY CLIENT-ID - PUBLIC ENDPOINT
  @Get('/:clientId')
  findAll(@Param('clientId') clientId: string) {
    return this.clientAddressService.findAllByClientID(+clientId);
  }

  @Delete('/:addressId')
  removeOne(@Param('addressId') addressId: string) {
    return this.clientAddressService.remove(+addressId);
  }
}
