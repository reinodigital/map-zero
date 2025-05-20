import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountType } from './account-type.entity';
import { Item } from 'src/modules/item/entities/item.entity';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 16, nullable: false, unique: true })
  code: string; // A unique code/number for this account

  @Column({ nullable: false, unique: true })
  name: string; // A short title for this account

  @Column({ nullable: true, default: null })
  description?: string; // A description of how this account should be used

  @Column({ length: 16, nullable: true, default: null })
  tax?: string; // The default tax setting for this account (01 | 02 | 03 | 04 | 05 | 06)

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  // RELATIONS
  @ManyToOne(() => AccountType, (accountType) => accountType.accounts, {
    nullable: false,
  })
  accountType: AccountType;

  @OneToMany(() => Item, (item) => item.saleAccount)
  itemsSaleAccount: Item[];

  @OneToMany(() => Item, (item) => item.purchaseAccount)
  itemsPurchaseAccount: Item[];
}
