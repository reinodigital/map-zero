import { Item } from 'src/modules/item/entities/item.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndItemAll {
  count: number;
  items: Item[];
}

export interface IDetailItem extends Item {
  tracking: Tracking[];
}
