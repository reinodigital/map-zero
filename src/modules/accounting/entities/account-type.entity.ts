import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('account_type')
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string; // type of accounting, see examples below

  @Column({ nullable: false })
  category: string; // ASSETS | EQUITY | EXPENSES | Liabilities | Revenue

  @OneToMany(() => Account, (account) => account.accountType)
  accounts: Account[];
}

/* Type account Xero software has as default */
/*
- ASSETS: ["Current Asset", "Fixed Asset", "Inventory", "Non-current Asset", "Prepayment"]
- EQUITY: ["Equity"]
- EXPENSES: ["Depreciation", "Direct Costs", "Expense", "Overhead"]
- Liabilities: ["Current Liability", "Liability", "Non-current Liability"]
- Revenue: ["Other income", "Revenue", "Sales"]
*/
