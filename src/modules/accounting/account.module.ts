import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AccountTypeController } from './account-type.controller';
import { AccountController } from './account.controller';

import { AccountTypeService } from './account-type.service';
import { AccountService } from './account.service';

import { AccountType } from './entities/account-type.entity';
import { Account } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountType, Account]), AuthModule],
  controllers: [AccountTypeController, AccountController],
  providers: [AccountTypeService, AccountService],
  exports: [TypeOrmModule],
})
export class AccountModule {}
