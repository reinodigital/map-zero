import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ nullable: true, default: null })
  account?: string;

  @Column({ nullable: true, default: null })
  taxRate?: string; // it will be the label of type of IVA

  @Column({ type: 'float', nullable: false })
  amount: number; // calculation with discount and IVA

  @ManyToOne(() => Item, (item) => item.quoteItems, {
    nullable: false,
  })
  item: Item;

  @ManyToOne(() => Quote, (quote) => quote.quoteItems, {
    nullable: false,
  })
  quote: Quote;
}
