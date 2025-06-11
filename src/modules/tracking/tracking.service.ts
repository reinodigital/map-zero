import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { Tracking } from './entities/tracking.entity';

import { CreateTrackingDto } from './dto/create-tracking.dto';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    private readonly dataSource: DataSource,
  ) {}

  // CREATE TRACKING
  async create(createTrackingDto: CreateTrackingDto): Promise<Tracking> {
    const { refEntity, refEntityId } = createTrackingDto;

    // verify entity exists
    await this.verifyOneTrack(refEntity, refEntityId);

    const newTracking = this.trackingRepository.create({
      ...createTrackingDto,
    });

    return await this.trackingRepository.save(newTracking);
  }

  // VERIFY ONE ROW EXISTS ON ENTITY
  async verifyOneTrack(
    refEntity: string,
    refEntityId: number,
  ): Promise<ObjectLiteral> {
    try {
      const record = await this.dataSource
        .getRepository(refEntity)
        .findOneBy({ id: refEntityId });

      if (!record) {
        throw new BadRequestException(
          `Record row de la Entidad: ${refEntity} con ID: ${refEntityId} no encontrado.`,
        );
      }

      return record;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // FIND MANY TRACKING BY ENTITY-ID
  async fetchTrackings(
    refEntity: string,
    refEntityId: number,
  ): Promise<Tracking[]> {
    try {
      // verify entity exists
      await this.verifyOneTrack(refEntity, refEntityId);

      const trackings = await this.trackingRepository.find({
        where: { refEntity, refEntityId },
        order: { id: 'DESC' },
      });

      return trackings;
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
      `Error not handled yet at Tracking-Service. Error: ${err}`,
    );
  }
}
