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

import { AuthDecorator } from '../auth/decorators';
import { AccountService } from './account.service';

import { SecurityRoles } from 'src/enums';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { FindAllAccountsDto } from './dto/find-all-accounts.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.ACCOUNTANT,
  )
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @AuthDecorator()
  findAll(@Query() findAllAccountsDto: FindAllAccountsDto) {
    return this.accountService.findAll(findAllAccountsDto);
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.ACCOUNTANT,
  )
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.ACCOUNTANT,
  )
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
