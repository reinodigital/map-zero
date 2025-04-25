import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthDecorator } from 'src/modules/auth/decorators';
import { ClientsService } from './client.service';

import { CreateClientDto, UpdateClientDto } from './dto/create-client.dto';
import { FindAllClientsDto } from './dto/find-all-clients.dto';
import { SecurityRoles } from 'src/enums';

@Controller('client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @AuthDecorator(SecurityRoles.ADMIN, SecurityRoles.SELLER)
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
    SecurityRoles.ACCOUNTANT,
  )
  @Get()
  findAll(@Query() findAllClientsDto: FindAllClientsDto) {
    return this.clientsService.findAll(findAllClientsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
