import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Province } from './entities/province.entity';
import { Canton } from './entities/canton.entity';
import { District } from './entities/district.entity';

@Injectable()
export class TerritoryService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(Canton)
    private readonly cantonRepository: Repository<Canton>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  // FIND ALL 7 PROVINCES
  async findProvinces(): Promise<Province[]> {
    try {
      return await this.provinceRepository.find();
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }
  }

  // FIND CANTONS BY PROVINCE ID
  async findCantonsByProvinceId(provinceId: number): Promise<Canton[]> {
    try {
      const province = await this.provinceRepository.findOneBy({
        id: provinceId,
      });
      if (!province) {
        throw new BadRequestException(
          `Provincia con ID: ${provinceId} no existe en base datos.`,
        );
      }

      return await this.cantonRepository.findBy({ province });
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }
  }

  // FIND DISTRICTS BY CANTON ID
  async findDistrictsByCantonId(cantonId: number): Promise<District[]> {
    try {
      const canton = await this.cantonRepository.findOneBy({ id: cantonId });
      if (!canton) {
        throw new BadRequestException(
          `Canton con ID: ${cantonId} no existe en base datos.`,
        );
      }

      return await this.districtRepository.findBy({ canton });
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }
  }

  // This function will be called only for SEED create territories of CR
  public async createTerritoriesEntities(data: any[]): Promise<void> {
    // This code is executed only one time
    const existsProvinces = await this.provinceRepository.find();
    if (existsProvinces && existsProvinces.length) {
      throw new BadRequestException(
        'SEED of create territories of CR already was called.',
      );
    }

    for (const row of data) {
      // Create Province
      let province = await this.provinceRepository.findOneBy({
        code: row['CODIGO_PROVINCIA'],
      });
      if (!province) {
        province = this.provinceRepository.create({
          code: row['CODIGO_PROVINCIA'],
          name: row['PROVINCIA'],
        });
        await this.provinceRepository.save(province);
      }

      // Create Canton
      let canton = await this.cantonRepository.findOneBy({
        code: row['CODIGO_CANTON'],
      });
      if (!canton) {
        canton = this.cantonRepository.create({
          code: row['CODIGO_CANTON'],
          name: row['CANTON'],
          province,
        });
        await this.cantonRepository.save(canton);
      }

      // Create District
      let district = await this.districtRepository.findOneBy({
        code: row['CODIGO_DISTRITO'],
      });
      if (!district) {
        district = this.districtRepository.create({
          code: row['CODIGO_DISTRITO'],
          name: row['DISTRITO'],
          canton,
        });
        await this.districtRepository.save(district);
      }
    }
  }

  // --------------- HELPERS ----------------
  private handleExceptionsErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }
    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not implemented at Territory-CR Service: ${err}`,
    );
  }
}
