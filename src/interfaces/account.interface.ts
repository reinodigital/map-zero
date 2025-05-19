import { Account } from 'src/modules/accounting/entities/account.entity';

export interface ICountAndAccountAll {
  count: number;
  accounts: Account[];
}
