import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from './entities/client.entity';

import { CreateClientDto, UpdateClientDto } from './dto/create-client.dto';
import { ICountAndClientAll, IMessage } from 'src/interfaces';
import { FindAllClientsDto } from './dto/find-all-clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<IMessage> {
    const { name, email, ...restClient } = createClientDto;

    try {
      const existsClientWithName = await this.clientRepository.findOneBy({
        name,
      });
      if (existsClientWithName) {
        throw new BadRequestException('Cliente con ese nombre ya existe.');
      }

      const existsClientWithEmail = await this.clientRepository.findOneBy({
        email,
      });
      if (existsClientWithEmail) {
        throw new BadRequestException(
          'Cliente con ese correo corporativo ya existe.',
        );
      }

      const newClient = this.clientRepository.create({
        name,
        email,
        ...restClient,
      });

      await this.clientRepository.save(newClient);

      return { msg: 'Nuevo cliente agregado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findAll(
    findAllClientsDto: FindAllClientsDto,
  ): Promise<ICountAndClientAll> {
    const {
      limit = 10,
      offset = 0,
      name = null,
      mobile = null,
      email = null,
      identity = null,
    } = findAllClientsDto;

    const findOptions: FindManyOptions<Client> = {
      take: limit,
      skip: offset,
      order: {
        createdAt: 'desc',
      },
    };

    const whereConditions: any = {};
    if (name) {
      whereConditions.name = name;
    }
    if (mobile) {
      whereConditions.mobile = mobile;
    }
    if (email) {
      whereConditions.email = email;
    }
    if (identity) {
      whereConditions.identity = identity;
    }

    try {
      const [clients, total] =
        await this.clientRepository.findAndCount(findOptions);

      return {
        count: total,
        clients,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findOne(id: number): Promise<Client> {
    try {
      const client = await this.clientRepository.findOneBy({ id });
      if (!client) {
        throw new BadRequestException(`Cliente con ID: ${id} no encontrado.`);
      }

      return client;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async update(
    id: number,
    updateClientDto: UpdateClientDto,
  ): Promise<IMessage> {
    const { name, email, isActive, ...restClient } = updateClientDto;

    try {
      const oldClient = await this.findOne(id);
      const activeStatus = isActive
        ? isActive === 'active'
        : oldClient.isActive;

      if (name && name !== oldClient.name) {
        // wants to update name client
        const existsClientWithName = await this.clientRepository.findOneBy({
          name,
        });
        if (existsClientWithName && existsClientWithName.id !== oldClient.id) {
          throw new BadRequestException('Cliente con ese nombre ya existe.');
        }
      }

      if (email && oldClient.email !== email) {
        const existsClientWithEmail = await this.clientRepository.findOneBy({
          email,
        });
        if (
          existsClientWithEmail &&
          existsClientWithEmail.id !== oldClient.id
        ) {
          throw new BadRequestException(
            'Cliente con ese correo corporativo ya existe.',
          );
        }
      }

      const updatedClient = await this.clientRepository.preload({
        id,
        name,
        email,
        isActive: activeStatus,
        ...restClient,
      });

      await this.clientRepository.save(updatedClient!);

      return { msg: 'Cliente actualizado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async remove(id: number): Promise<IMessage> {
    try {
      await this.findOne(id);

      await this.clientRepository.update({ id }, { isActive: false });

      return { msg: 'Cliente desactivado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private handleErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at ClientService. Error: ${err}`,
    );
  }
}
