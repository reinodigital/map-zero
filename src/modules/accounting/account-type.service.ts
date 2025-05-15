import { Injectable } from '@nestjs/common';

import {
  CreateAccountTypeDto,
  UpdateAccountTypeDto,
} from './dto/create-account-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountTypeService {
  constructor(
    @InjectRepository(AccountType)
    private readonly clientRepository: Repository<AccountType>,
  ) {}

  create(createAccountTypeDto: CreateAccountTypeDto) {
    return 'This action adds a new account type';
  }

  findAll() {
    return `This action returns all account type`;
  }

  update(id: number, updateAccountTypeDto: UpdateAccountTypeDto) {
    return `This action updates a #${id} account type`;
  }

  remove(id: number) {
    return `This action removes a #${id} account type`;
  }
}
