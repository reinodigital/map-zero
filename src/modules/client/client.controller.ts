import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthDecorator, GetUser } from 'src/modules/auth/decorators';
import { ClientsService } from './client.service';

import { CreateClientDto, UpdateClientDto } from './dto/create-client.dto';
import { FindAllClientsDto } from './dto/find-all-clients.dto';
import { ListDataUser, SecurityRoles } from 'src/enums';

@Controller('client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  @Post()
  create(
    @Body() createClientDto: CreateClientDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientsService.create(createClientDto, userName);
  }

  @AuthDecorator()
  @Get('all-short')
  fetchAllShort() {
    return this.clientsService.findAllShort();
  }

  @AuthDecorator()
  @Get('find-economic-activities/:id')
  findEconomicActivities(@Param('id', ParseIntPipe) clientId: string) {
    return this.clientsService.findEconomicActivities(+clientId);
  }

  @AuthDecorator()
  @Get()
  findAll(@Query() findAllClientsDto: FindAllClientsDto) {
    return this.clientsService.findAll(findAllClientsDto);
  }

  @AuthDecorator()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.clientsService.findOneEndpoint(+id);
  }

  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientsService.update(+id, updateClientDto, userName);
  }

  @AuthDecorator(SecurityRoles.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.clientsService.remove(+id, userName);
  }
}
