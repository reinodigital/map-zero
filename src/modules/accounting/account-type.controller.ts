import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';

import { AuthDecorator } from '../auth/decorators';
import { AccountTypeService } from './account-type.service';

import {
  CreateAccountTypeDto,
  UpdateAccountTypeDto,
} from './dto/create-account-type.dto';
import { SecurityRoles } from 'src/enums';

@Controller('account-type')
export class AccountTypeController {
  constructor(private readonly accountTypeService: AccountTypeService) {}

  @Post()
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.ACCOUNTANT,
  )
  create(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    return this.accountTypeService.create(createAccountTypeDto);
  }

  @Get()
  @AuthDecorator()
  findAll() {
    return this.accountTypeService.findAll();
  }

  @Patch(':id')
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.ACCOUNTANT,
  )
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountTypeService.update(+id, updateAccountTypeDto);
  }
}
