import { Controller, Post, Body, Param, Delete } from '@nestjs/common';

import { AuthDecorator, GetUser } from '../auth/decorators';
import { ClientContactService } from './client-contact.service';

import { CreateClientContactDto } from './dto/create-client-contact.dto';
import { RemoveClientContactAddressDto } from './dto/remove-client-contact-address.dto';
import { ListDataUser } from 'src/enums';

@Controller('client-contact')
export class ClientContactController {
  constructor(private readonly clientContactService: ClientContactService) {}

  @Post('new-one/:clientId')
  @AuthDecorator()
  createAddress(
    @Param('clientId') clientId: string,
    @Body() createClientContactDto: CreateClientContactDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientContactService.create(
      +clientId,
      createClientContactDto,
      userName,
    );
  }

  // @Get('/:clientId')
  // findAll(@Param('clientId') clientId: string) {
  //   return this.clientContactService.findAllByClientID(+clientId);
  // }

  @Delete('/:contactId')
  @AuthDecorator()
  removeOne(
    @Param('contactId') contactId: string,
    @Body() removeClientContactAddressDto: RemoveClientContactAddressDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientContactService.remove(
      +contactId,
      removeClientContactAddressDto,
      userName,
    );
  }
}
