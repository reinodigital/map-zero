import { Controller, Post, Body, Param, Delete } from '@nestjs/common';

import { AuthDecorator } from '../auth/decorators';
import { ClientContactService } from './client-contact.service';

import { CreateClientContactDto } from './dto/create-client-contact.dto';

@Controller('client-contact')
export class ClientContactController {
  constructor(private readonly clientContactService: ClientContactService) {}

  @Post('new-one/:clientId')
  @AuthDecorator()
  createAddress(
    @Param('clientId') clientId: string,
    @Body() createClientContactDto: CreateClientContactDto,
  ) {
    return this.clientContactService.create(+clientId, createClientContactDto);
  }

  // @Get('/:clientId')
  // findAll(@Param('clientId') clientId: string) {
  //   return this.clientContactService.findAllByClientID(+clientId);
  // }

  @Delete('/:contactId')
  removeOne(@Param('contactId') contactId: string) {
    return this.clientContactService.remove(+contactId);
  }
}
