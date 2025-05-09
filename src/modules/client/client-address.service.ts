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

import { TrackingService } from '../tracking/tracking.service';

import { IMessage } from 'src/interfaces';
import { CreateClientAddressDto } from './dto/create-client-address.dto';
import { ActionOverEntity, NameEntities } from 'src/enums';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { formatDateAsReadable } from '../shared/helpers/format-date-as-readable.helper';
import { RemoveClientContactAddressDto } from './dto/remove-client-contact-address.dto';

@Injectable()
export class ClientAddressService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientAddress)
    private readonly clientAddressRepository: Repository<ClientAddress>,

    private readonly trackingService: TrackingService,
  ) {}

  async createNewOne(
    clientId: number,
    createClientAddressDto: CreateClientAddressDto,
    userName: string,
  ): Promise<IMessage> {
    const { createdAt, ...restCreateAddress } = createClientAddressDto;
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
        ...restCreateAddress,
        client,
      });

      const addressSaved = await this.clientAddressRepository.save(newAddress);

      // generate tracking
      const trackingDto = this.generateTracking(
        userName,
        ActionOverEntity.ADDED,
        createdAt,
        client,
        `${addressSaved.provinceName}, ${addressSaved.cantonName}, ${addressSaved.districtName} ...`,
      );
      await this.trackingService.create(trackingDto);

      return { msg: 'Dirección de cliente agregada correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // PUBLIC ENDPOINT
  // async findAllByClientID(clientId: number): Promise<ClientAddress[]> {
  //   try {
  //     const addresses = await this.clientAddressRepository.find({
  //       where: { client: { id: clientId } },
  //     });

  //     return addresses ?? [];
  //   } catch (error) {
  //     this.handleErrorsOnDB(error);
  //   }
  // }

  async findOne(id: number): Promise<ClientAddress> {
    try {
      const clientAddress = await this.clientAddressRepository.findOne({
        where: { id },
        relations: { client: true },
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

  async remove(
    id: number,
    removeClientContactAddressDto: RemoveClientContactAddressDto,
    userName: string,
  ): Promise<IMessage> {
    try {
      const clientAddress = await this.findOne(id);
      const client = clientAddress.client;

      await this.clientAddressRepository.remove(clientAddress);

      // generate tracking
      const trackingDto = this.generateTracking(
        userName,
        ActionOverEntity.REMOVED,
        removeClientContactAddressDto.removedAt,
        client,
        `${clientAddress.provinceName}, ${clientAddress.cantonName}, ${clientAddress.districtName} ...`,
      );
      await this.trackingService.create(trackingDto);

      return { msg: 'Dirección de cliente removida correctamente.' };
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    client: Client,
    shortAddress: string,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail: `Dirección ${shortAddress} ${action}`,
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
      `Error not handled yet at Client-Address Service: ${err}`,
    );
  }
}
