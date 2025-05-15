import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { AccountService } from './account.service';

import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { AuthDecorator } from '../auth/decorators';
import { SecurityRoles } from 'src/enums';

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
  findAll() {
    return this.accountService.findAll();
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
