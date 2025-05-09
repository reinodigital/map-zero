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

import { TrackingService } from '../tracking/tracking.service';
import { formatDateAsReadable } from '../shared/helpers/format-date-as-readable.helper';

import { CreateClientContactDto } from './dto/create-client-contact.dto';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { RemoveClientContactAddressDto } from './dto/remove-client-contact-address.dto';
import { ActionOverEntity, NameEntities } from 'src/enums';
import { IMessage } from 'src/interfaces';

@Injectable()
export class ClientContactService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientContact)
    private readonly clientContactRepository: Repository<ClientContact>,

    private readonly trackingService: TrackingService,
  ) {}

  async create(
    clientId: number,
    createClientContactDto: CreateClientContactDto,
    userName: string,
  ): Promise<IMessage> {
    const { createdAt, ...restCreateClientContactDto } = createClientContactDto;
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
        ...restCreateClientContactDto,
        client,
      });

      const savedClientContact =
        await this.clientContactRepository.save(newContact);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.ADDED,
        createdAt,
        client,
        savedClientContact.name,
      );
      await this.trackingService.create(itemTrackingDto);

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
      const clientContact = await this.clientContactRepository.findOne({
        where: { id },
        relations: { client: true },
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

  async remove(
    id: number,
    removeClientContactAddressDto: RemoveClientContactAddressDto,
    userName: string,
  ): Promise<IMessage> {
    try {
      const clientContact = await this.findOne(id);

      const client = clientContact.client;

      await this.clientContactRepository.remove(clientContact);

      // generate tracking
      const trackingDto = this.generateTracking(
        userName,
        ActionOverEntity.REMOVED,
        removeClientContactAddressDto.removedAt,
        client,
        clientContact.name,
      );
      await this.trackingService.create(trackingDto);

      return { msg: 'Contacto de cliente removido correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    client: Client,
    clientContactName: string,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail: `Contacto con nombre ${clientContactName} ${action}`,
      refEntity: NameEntities.CLIENT,
      refEntityId: client.id,
    };

    return newTracking;
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
