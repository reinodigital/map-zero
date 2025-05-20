import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Account } from 'src/modules/accounting/entities/account.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Quote } from './quote.entity';

@Entity('quote_item')
export class QuoteItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  description?: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  discount: number = 0;

  @ManyToOne(() => Account, (account) => account.quoteItems, {
    nullable: false,
  })
  account: Account;

  @Column({ nullable: true, default: null })
  taxRate?: string; // it will be the label of type of IVA

  @Column({ type: 'float', nullable: false })
  amount: number; // calculation with discount and IVA

  /* RELATIONS */
  @ManyToOne(() => Item, (item) => item.quoteItems, {
    nullable: false,
  })
  item: Item;

  @ManyToOne(() => Auth, (auth) => auth.quoteItems, { nullable: true })
  seller?: Auth | null;

  @ManyToOne(() => Quote, (quote) => quote.quoteItems, {
    nullable: false,
  })
  quote: Quote;
}
