import { Client } from 'src/modules/client/entities/client.entity';

export interface ICountAndClientAll {
  count: number;
  clients: Client[];
}
