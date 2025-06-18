import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';

import { ActivityService } from '../economic-activities/activity.service';
import { CabysService } from '../cabys/cabys.service';
import { TerritoryService } from '../territory/territory.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly activityService: ActivityService,
    private readonly territoryService: TerritoryService,
    private readonly cabysService: CabysService,
  ) {}

  // Parsed csv file to array of objects
  async createTerritoriesObjects(): Promise<void> {
    const csvFilePath = path.join(
      '/usr/src/app/seed-data',
      'territories_cr.csv',
    );

    const results: any[] = [];

    const stream = fs
      .createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        await this.callToCreateTerritoriesEntities(results);
      });
  }

  private async callToCreateTerritoriesEntities(results: any[]): Promise<void> {
    await this.territoryService.createTerritoriesEntities(results);
  }

  // Parsed csv file to array of objects
  async createCabysList(): Promise<void> {
    // Absolute path inside container
    const csvFilePath = path.join('/usr/src/app/seed-data', 'cabys_2025.csv');

    const results: any[] = [];

    const stream = fs
      .createReadStream(csvFilePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        await this.callToCreateCabysList(results);
      });
  }

  private async callToCreateCabysList(results: any[]): Promise<void> {
    await this.cabysService.createListOfCabys(results);
  }

  // Parsed JSON file to array of objects
  async createEconomicActivities(): Promise<void> {
    const jsonFilePath = path.join(
      '/usr/src/app/seed-data',
      'actividades.json',
    );

    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    await this.activityService.createListActivities(parsedData);
  }
}
