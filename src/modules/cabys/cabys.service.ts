import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { CabysList } from './entities/cabys-list.entity';

@Injectable()
export class CabysService {
  constructor(
    @InjectRepository(CabysList)
    private readonly cabysListRepository: Repository<CabysList>,
  ) {}

  async findOneCabys(code: string): Promise<CabysList> {
    const cabys = await this.cabysListRepository.findOneBy({ code });

    if (!cabys) {
      throw new BadRequestException(`Cabys ${cabys} no existe en sistema.`);
    }

    return cabys;
  }

  // This code is executed only one time
  public async createListOfCabys(data: any[]): Promise<void> {
    const connection = this.cabysListRepository.manager.connection;
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existsCabys = await this.cabysListRepository.findOneBy({ id: 1 });
      if (existsCabys) {
        throw new BadRequestException(
          'SEED of create Cabys List already was called.',
        );
      }

      const insertValues: string[] = [];

      for (const row of data) {
        const ivaRaw = row['IVA'] || '0%';
        const ivaParts = ivaRaw.split('%');
        const iva =
          ivaParts.length > 0 && !isNaN(Number(ivaParts[0]))
            ? Number(ivaParts[0])
            : 0;
        const code = row['CODE'].replace(/'/g, "''"); // Escape single quotes
        const description =
          `${row['CODE']} - ${row['IVA']} - ${row['DESCRIPTION']}`.replace(
            /'/g,
            "''",
          );

        insertValues.push(`('${code}', '${description}', ${iva})`);
      }

      const insertQuery = `
          INSERT INTO cabys_list (code, description, tax) VALUES ${insertValues.join(', ')};
        `;

      await queryRunner.query(insertQuery);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `An error has occurred creating List of Cabys. Error: ${error}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
