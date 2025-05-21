import { Account } from 'src/modules/accounting/entities/account.entity';
import { CabysList } from 'src/modules/cabys/entities/cabys-list.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndItemAll {
  count: number;
  items: Item[];
}

export interface IDetailItem extends Item {
  tracking: Tracking[];
}

export interface IItemForSelect {
  id: number;
  name: string;
  cabys: CabysList;
  salePrice?: number;
  saleAccount?: Account;
  saleTaxRate?: string;
  saleDescription?: string;
}
