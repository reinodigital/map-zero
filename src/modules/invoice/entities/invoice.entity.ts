import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Client } from 'src/modules/client/entities/client.entity';
import { InvoiceItem } from './invoice-item.entity';
import { DecimalTransformer } from 'src/modules/shared/transformers/decimal-value.transformer';

import { StatusInvoice } from 'src/enums';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false, default: StatusInvoice.DRAFT })
  status: string;

  @Column({ length: 32, nullable: false, default: 'FA-' })
  invoiceNumber: string;

  @Column({ length: 64, nullable: true, default: null })
  reference?: string; // FA-XXX

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: new DecimalTransformer(),
  })
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

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ nullable: true, default: null })
  emisorActivities?: string; // will contain the activities apply to this invoice for emisor as string separated by comma

  @Column({ nullable: true, default: null })
  receptorActivities?: string; // will contain the activities apply to this invoice for that client as string separated by comma

  // Relations
  @ManyToOne(() => Client, (client) => client.invoices, { nullable: false })
  client: Client;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: ['insert', 'update'],
  })
  invoiceItems: InvoiceItem[];
}
