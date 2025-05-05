import { Client } from 'src/modules/client/entities/client.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndClientAll {
  count: number;
  clients: Client[];
}

export interface IDetailClient extends Client {
  tracking: Tracking[];
}
