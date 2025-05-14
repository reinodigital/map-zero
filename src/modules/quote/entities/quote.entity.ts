import { Client } from 'src/modules/client/entities/client.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuoteItem } from './quote-item.entity';
import { StatusQuote } from 'src/enums';

@Entity('quote')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false, default: StatusQuote.DRAFT })
  status: string;

  @Column({ length: 32, nullable: false, default: 'QU-' })
  quoteNumber: string;

  @Column({ type: 'float', nullable: false })
  total: number; // total to pay

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: {
      to: (value: string | null) => (value ? new Date(value) : null),
      from: (value: Date | null) => value,
    },
  })
  initDate?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: {
      to: (value: string | null) => (value ? new Date(value) : null),
      from: (value: Date | null) => value,
    },
  })
  expireDate?: Date;

  @Column({ length: 16, nullable: false })
  currency: string;

  @Column({ nullable: true, default: null })
  terms?: string; // field to explain some term or condition

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Client, (client) => client.quotes, { nullable: false })
  client: Client;

  @OneToMany(() => QuoteItem, (quoteItem) => quoteItem.quote, {
    cascade: ['insert', 'update'],
  })
  quoteItems: QuoteItem[];
}
