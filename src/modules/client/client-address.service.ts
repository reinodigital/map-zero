import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from './entities/client.entity';
import { ClientAddress } from './entities/client-address.entity';

import { IMessage } from 'src/interfaces';
import { CreateClientAddressDto } from './dto/create-client-address.dto';

@Injectable()
export class ClientAddressService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientAddress)
    private readonly clientAddressRepository: Repository<ClientAddress>,
  ) {}

  async createNewOne(
    clientId: number,
    createClientAddressDto: CreateClientAddressDto,
  ): Promise<IMessage> {
    try {
      const client = await this.clientRepository.findOneBy({ id: clientId });
      if (!client) {
        throw new BadRequestException(
          `Cliente con ID: ${clientId} no encontrado.`,
        );
      }

      const [addresses, count] =
        await this.clientAddressRepository.findAndCountBy({
          client: { id: clientId },
        });

      if (count > 2) {
        throw new BadRequestException(
          'Ya el cliente cuenta con 3 direcciones. Si desea agregar una nueva debe eliminar al menos una antigua.',
        );
      }

      const newAddress = this.clientAddressRepository.create({
        ...createClientAddressDto,
        client,
      });

      await this.clientAddressRepository.save(newAddress);

      return { msg: 'Dirección de cliente agregada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // PUBLIC ENDPOINT
  async findAllByClientID(clientId: number): Promise<ClientAddress[]> {
    try {
      const addresses = await this.clientAddressRepository.find({
        where: { client: { id: clientId } },
      });

      return addresses ?? [];
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async findOne(id: number): Promise<ClientAddress> {
    try {
      const clientAddress = await this.clientAddressRepository.findOneBy({
        id,
      });
      if (!clientAddress) {
        throw new BadRequestException(
          `Dirección de cliente con ID: ${id} no encontrada.`,
        );
      }

      return clientAddress;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async remove(id: number): Promise<IMessage> {
    try {
      const clientAddress = await this.findOne(id);

      await this.clientAddressRepository.remove(clientAddress);

      return { msg: 'Dirección de cliente removida correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  private handleErrorsOnDB(err: any): never {
    if (err.status === 400) {
      throw new BadRequestException(err.response.message);
    }

    if (err.status === 401) {
      throw new UnauthorizedException(err.response.message);
    }

    if (err.errno === 1052) {
      throw new BadRequestException(err.sqlMessage);
    }

    throw new InternalServerErrorException(
      `Error not handled yet at Client-Address Service: ${err}`,
    );
  }
}
