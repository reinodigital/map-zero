import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Account } from './entities/account.entity';
import { AccountType } from './entities/account-type.entity';

import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { ICountAndAccountAll, IMessage } from 'src/interfaces';
import { FindAllAccountsDto } from './dto/find-all-accounts.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(AccountType)
    private readonly accountTypeRepository: Repository<AccountType>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<IMessage> {
    const { code, name, description, tax, accountTypeId } = createAccountDto;

    try {
      const existCode = await this.accountRepository.findOneBy({ code });
      if (existCode) {
        throw new BadRequestException(
          `Ya existe una cuenta con el código ${code}.`,
        );
      }

      const existName = await this.accountRepository.findOneBy({ name });
      if (existName) {
        throw new BadRequestException(
          `Ya existe una cuenta con el nombre ${name}.`,
        );
      }

      const accountType = await this.accountTypeRepository.findOneBy({
        id: accountTypeId,
      });

      if (!accountType) {
        throw new NotFoundException(
          `No se encontró el tipo de cuenta con ID ${accountTypeId}.`,
        );
      }

      const newAccount = this.accountRepository.create({
        code,
        name,
        description,
        tax,
        isActive: true,
        accountType,
      });

      await this.accountRepository.save(newAccount);

      return { msg: 'Nueva cuenta registrada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findAll(
    findAllAccountsDto: FindAllAccountsDto,
  ): Promise<ICountAndAccountAll> {
    const { limit = 10, offset = 0, name = null } = findAllAccountsDto;

    const findOptions: FindManyOptions<Account> = {
      take: limit,
      skip: offset,
      order: {
        id: 'desc',
      },
      relations: { accountType: true },
    };

    const whereConditions: any = {};
    if (name) {
      whereConditions.name = Like(`%${name}%`);
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
    }

    try {
      const [accounts, total] =
        await this.accountRepository.findAndCount(findOptions);

      return {
        count: total,
        accounts,
      };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findOne(id: number): Promise<Account> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id },
        relations: ['accountType'],
      });

      if (!account) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada.`);
      }

      return account;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<IMessage> {
    const { code, name, accountTypeId } = updateAccountDto;

    try {
      const account = await this.accountRepository.findOne({
        where: { id },
        relations: { accountType: true },
      });

      if (!account) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada.`);
      }

      if (code && code !== account.code) {
        const codeExists = await this.accountRepository.findOneBy({ code });
        if (codeExists) {
          throw new BadRequestException(
            `Ya existe una cuenta con el código ${code}.`,
          );
        }
      }

      if (name && name !== account.name) {
        const nameExists = await this.accountRepository.findOneBy({ name });
        if (nameExists) {
          throw new BadRequestException(
            `Ya existe una cuenta con el nombre ${name}.`,
          );
        }
      }

      if (accountTypeId && accountTypeId !== account.accountType.id) {
        const accountType = await this.accountTypeRepository.findOneBy({
          id: accountTypeId,
        });

        if (!accountType) {
          throw new NotFoundException(
            `No se encontró el tipo de cuenta con ID ${accountTypeId}.`,
          );
        }

        account.accountType = accountType;
      }

      Object.assign(account, updateAccountDto);

      await this.accountRepository.save(account);

      return { msg: 'Cuenta actualizada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async remove(id: number): Promise<IMessage> {
    try {
      const account = await this.accountRepository.findOneBy({ id });

      if (!account) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada.`);
      }

      await this.accountRepository.update({ id }, { isActive: false });

      return { msg: 'Cuenta eliminada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  private handleErrorsOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at Account-Service. Error: ${err}`,
    );
  }
}
