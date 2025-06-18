import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryRunner, Repository } from 'typeorm';

import { Activity } from './entities/activity.entity';

import {
  ActivitiesSuggestionResponse,
  ActivitySuggestion,
  Constants,
} from 'src/interfaces';
import { SimplePaginationDto } from '../shared/dto/simple_pagination.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async findOne(code: string): Promise<Activity> {
    try {
      const activity = await this.activityRepository.findOneBy({ code });

      if (!activity) {
        throw new BadRequestException(
          `Actividad económica con código ${code} no encontrada.`,
        );
      }

      return activity;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async getActivitiesSuggestions(
    term: string,
    simplePaginationDto: SimplePaginationDto,
  ): Promise<ActivitiesSuggestionResponse> {
    const { limit = 12, offset = 0 } = simplePaginationDto;
    try {
      const suggestions: ActivitySuggestion[] = [];
      const [activities, total] = await this.activityRepository.findAndCount({
        where: [
          { code: Like(`%${term.trim()}%`) },
          { name: Like(`%${term.trim()}%`) },
          { description: Like(`%${term.trim()}%`) },
        ],
        take: limit,
        skip: offset,
        order: {
          name: 'desc',
        },
      });

      if (!activities.length) {
        suggestions.push({
          code: null,
          name: null,
          description: Constants.NOT_RESULTS,
        });
      } else {
        for (const activity of activities) {
          suggestions.push({
            code: activity.code,
            name: activity.name,
            description: activity.description,
          });
        }
      }

      return {
        count: total,
        isValid: activities?.length ? true : false,
        suggestions,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // ======= This code is executed only one time ========
  public async createListActivities(data: any[]): Promise<void> {
    const connection = this.activityRepository.manager.connection;
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existsActivities = await this.activityRepository.findOneBy({
        id: 1,
      });
      if (existsActivities) {
        throw new BadRequestException(
          'SEED of create Activities List already was called.',
        );
      }

      const insertValues: string[] = [];

      for (const code of Object.keys(data)) {
        const activity = data[code];
        const name = activity.actividad.replace(/'/g, "''");
        const description = activity.descripcion.replace(/'/g, "''");

        insertValues.push(`('${code}', '${name}', '${description}')`);
      }

      const insertQuery = `
      INSERT INTO activity (code, name, description)
      VALUES ${insertValues.join(', ')};
    `;

      await queryRunner.query(insertQuery);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `An error has occurred creating List of Activities. Error: ${error}`,
      );
    } finally {
      await queryRunner.release();
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
      `Error not handled yet at Activities-Service. Error: ${err}`,
    );
  }
}
