import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountType } from './entities/account-type.entity';

import {
  CreateAccountTypeDto,
  UpdateAccountTypeDto,
} from './dto/create-account-type.dto';
import { IMessage } from 'src/interfaces';

@Injectable()
export class AccountTypeService {
  constructor(
    @InjectRepository(AccountType)
    private readonly accountTypeRepository: Repository<AccountType>,
  ) {}

  async create(createAccountTypeDto: CreateAccountTypeDto): Promise<IMessage> {
    const { name } = createAccountTypeDto;
    try {
      const existAccountTypeByName = await this.accountTypeRepository.findOneBy(
        { name },
      );
      if (existAccountTypeByName) {
        throw new BadRequestException(
          `Tipo de cuenta con nombre ${name} ya existe en sistema.`,
        );
      }

      const newAccountType = this.accountTypeRepository.create({ name });

      await this.accountTypeRepository.save(newAccountType);

      return { msg: 'Nuevo Tipo de cuenta agregada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findAll(): Promise<AccountType[]> {
    try {
      return await this.accountTypeRepository.find();
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findOne(id: number): Promise<AccountType> {
    try {
      const type = await this.accountTypeRepository.findOneBy({ id });
      if (!type) {
        throw new NotFoundException(
          `Tipo de cuenta con ID ${id} no encontrado.`,
        );
      }

      return type;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async update(
    id: number,
    updateAccountTypeDto: UpdateAccountTypeDto,
  ): Promise<IMessage> {
    try {
      const type = await this.accountTypeRepository.preload({
        id,
        ...updateAccountTypeDto,
      });

      if (!type) {
        throw new NotFoundException(
          `Tipo de cuenta con ID ${id} no encontrado.`,
        );
      }

      await this.accountTypeRepository.save(type);

      return { msg: 'Tipo de cuenta actualizado correctamente.' };
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
      `Error not handled yet at AccountType-Service. Error: ${err}`,
    );
  }
}
