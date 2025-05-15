import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { AccountTypeService } from './account-type.service';
import {
  CreateAccountTypeDto,
  UpdateAccountTypeDto,
} from './dto/create-account-type.dto';

@Controller('account-type')
export class AccountTypeController {
  constructor(private readonly accountTypeService: AccountTypeService) {}

  @Post()
  create(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    return this.accountTypeService.create(createAccountTypeDto);
  }

  @Get()
  findAll() {
    return this.accountTypeService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountTypeService.update(+id, updateAccountTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountTypeService.remove(+id);
  }
}
