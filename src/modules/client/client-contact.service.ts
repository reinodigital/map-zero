import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from './entities/client.entity';
import { ClientContact } from './entities/client-contact.entity';

import { IMessage } from 'src/interfaces';
import { CreateClientContactDto } from './dto/create-client-contact.dto';

@Injectable()
export class ClientContactService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientContact)
    private readonly clientContactRepository: Repository<ClientContact>,
  ) {}

  async create(
    clientId: number,
    createClientContactDto: CreateClientContactDto,
  ): Promise<IMessage> {
    try {
      const client = await this.clientRepository.findOneBy({ id: clientId });
      if (!client) {
        throw new BadRequestException(
          `Cliente con ID: ${clientId} no encontrado.`,
        );
      }

      const [contacts, count] =
        await this.clientContactRepository.findAndCountBy({
          client: { id: clientId },
        });

      if (count > 2) {
        throw new BadRequestException(
          'Ya el cliente cuenta con 3 contactos. Si desea agregar uno nueva debe eliminar al menos uno antiguo.',
        );
      }

      const newContact = this.clientContactRepository.create({
        ...createClientContactDto,
        client,
      });

      await this.clientContactRepository.save(newContact);

      return { msg: 'Contacto de cliente agregado correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // PUBLIC ENDPOINT
  // async findAllByClientID(clientId: number): Promise<ClientContact[]> {
  //   try {
  //     const contacts = await this.clientContactRepository.find({
  //       where: { client: { id: clientId } },
  //     });

  //     return contacts ?? [];
  //   } catch (error) {
  //     this.handleErrorsOnDB(error);
  //   }
  // }

  async findOne(id: number): Promise<ClientContact> {
    try {
      const clientContact = await this.clientContactRepository.findOneBy({
        id,
      });
      if (!clientContact) {
        throw new BadRequestException(
          `Contacto de cliente con ID: ${id} no encontrada.`,
        );
      }

      return clientContact;
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  async remove(id: number): Promise<IMessage> {
    try {
      const clientContact = await this.findOne(id);

      await this.clientContactRepository.remove(clientContact);

      return { msg: 'Contacto de cliente removido correctamente.' };
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
      `Error not handled yet at Client-Contact Service: ${err}`,
    );
  }
}
