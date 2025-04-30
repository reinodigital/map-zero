import { Item } from 'src/modules/item/entities/item.entity';

export interface ICountAndItemAll {
  count: number;
  items: Item[];
}
