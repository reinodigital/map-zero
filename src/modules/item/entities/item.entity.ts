import { CabysList } from 'src/modules/cabys/entities/cabys-list.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';
import { Account } from 'src/modules/accounting/entities/account.entity';
import { DecimalTransformer } from 'src/modules/shared/transformers/decimal-value.transformer';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string; // could be product or service code, example: "N454LEN56"

  @ManyToOne(() => CabysList, (cabys) => cabys.items, { nullable: false })
  cabys: CabysList;

  // Purchase fields
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
    transformer: new DecimalTransformer(),
  })
  costPrice?: number;

  @ManyToOne(() => Account, (account) => account.itemsPurchaseAccount, {
    nullable: true,
  })
  purchaseAccount?: Account; // select field example: "300 - Costo de Ventas Mercadería"

  @Column({ nullable: true, default: null })
  purchaseTaxRate?: string; // select field example: "Tarifa General 13%"

  @Column({ type: 'text', nullable: true, default: null })
  purchaseDescription?: string;
  // END Purchase fields

  // Sell fields
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
    transformer: new DecimalTransformer(),
  })
  salePrice?: number;

  @ManyToOne(() => Account, (account) => account.itemsSaleAccount, {
    nullable: true,
  })
  saleAccount?: Account; // select field example: "200 -  523601 Ventas de Mercadería"

  @Column({ nullable: true, default: null })
  saleTaxRate?: string; // select field example: "Tarifa General 13%"

  @Column({ type: 'text', nullable: true, default: null })
  saleDescription?: string;
  // END Sell fields

  @Column({
    type: 'timestamp',
    nullable: false,
    transformer: {
      to: (value: string) => new Date(value),
      from: (value: Date) => value,
    },
  })
  createdAt: Date;

  @OneToMany(() => QuoteItem, (quoteItem) => quoteItem.item)
  quoteItems: QuoteItem[];
}
