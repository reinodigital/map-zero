import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Activity } from '../economic-activities/entities/activity.entity';
import { Client } from './entities/client.entity';
import { TrackingService } from '../tracking/tracking.service';
import { ActivityService } from '../economic-activities/activity.service';

import {
  CreateClientDto,
  SelectedActivityDto,
  UpdateClientDto,
} from './dto/create-client.dto';
import { FindAllClientsDto } from './dto/find-all-clients.dto';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { ICountAndClientAll, IDetailClient, IMessage } from 'src/interfaces';
import { ActionOverEntity, NameEntities } from 'src/enums';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    private readonly trackingService: TrackingService,
    private readonly activityService: ActivityService,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    userName: string,
  ): Promise<IMessage> {
    const {
      name,
      email,
      createdAt,
      activities = [],
      ...restClient
    } = createClientDto;

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

      const activityEntities =
        await this.validateAndGetActivitiesEntities(activities);

      const newClient = this.clientRepository.create({
        name,
        email,
        createdAt,
        activities: activityEntities,
        ...restClient,
      });

      const clientSaved = await this.clientRepository.save(newClient);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CREATED,
        createdAt,
        clientSaved,
      );
      await this.trackingService.create(itemTrackingDto);

      return { msg: 'Nuevo cliente agregado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findAllShort() {
    try {
      const clients = await this.clientRepository.find({
        select: ['id', 'name'],
        order: { name: { direction: 'DESC' } },
      });

      return clients;
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
      whereConditions.name = Like(`%${name}%`);
    }
    if (mobile) {
      whereConditions.mobile = mobile;
    }
    if (email) {
      whereConditions.email = Like(`%${email}%`);
    }
    if (identity) {
      whereConditions.identity = identity;
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
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

  // endpoint
  async findOneEndpoint(id: number): Promise<IDetailClient> {
    try {
      const client = await this.clientRepository.findOne({
        where: { id },
        relations: { addresses: true, contacts: true, activities: true },
      });
      if (!client) {
        throw new BadRequestException(`Cliente con ID: ${id} no encontrado.`);
      }

      // fetch trackings
      const result: IDetailClient = {
        ...client,
        tracking: await this.trackingService.fetchTrackings(
          NameEntities.CLIENT,
          id,
        ),
      };

      return result;
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
    userName: string,
  ): Promise<IMessage> {
    const {
      name,
      email,
      isActive,
      updatedAt,
      activities = [],
      ...restClient
    } = updateClientDto;

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

      const activityEntities =
        await this.validateAndGetActivitiesEntities(activities);

      const updatedClient = await this.clientRepository.preload({
        id,
        name,
        email,
        activities: activityEntities,
        isActive: activeStatus,
        ...restClient,
      });

      const clientUpdated = await this.clientRepository.save(updatedClient!);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.EDITED,
        updatedAt,
        clientUpdated,
      );
      await this.trackingService.create(itemTrackingDto);

      return { msg: 'Cliente actualizado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async remove(id: number, userName: string): Promise<IMessage> {
    try {
      await this.findOne(id);

      await this.clientRepository.update({ id }, { isActive: false });

      return { msg: 'Cliente desactivado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    client: Client,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail: `Cliente ${client.name} ${action}`,
      refEntity: NameEntities.CLIENT,
      refEntityId: client.id,
    };

    return newTracking;
  }

  private async validateAndGetActivitiesEntities(
    activitiesDto: SelectedActivityDto[],
  ): Promise<Activity[]> {
    const arrActivityEntities: Activity[] = [];
    for (const activity of activitiesDto) {
      const existingActivity = await this.activityService.findOne(
        activity.code,
      );
      arrActivityEntities.push(existingActivity);
    }

    return arrActivityEntities;
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
