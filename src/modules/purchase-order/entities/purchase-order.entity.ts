import { Client } from 'src/modules/client/entities/client.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { StatusPurchaseOrder } from 'src/enums';
import { DecimalTransformer } from 'src/modules/shared/transformers/decimal-value.transformer';

@Entity('purchase_order')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false, default: StatusPurchaseOrder.DRAFT })
  status: string;

  @Column({ length: 32, nullable: false, default: 'OC-' })
  purchaseOrderNumber: string;

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
  deliveryDate?: Date;

  @Column({ length: 16, nullable: false })
  currency: string;

  @Column({ nullable: true, default: null })
  deliveryInstructions?: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Client, (client) => client.purchaseOrders, {
    nullable: false,
  })
  client: Client;

  @OneToMany(
    () => PurchaseOrderItem,
    (purchaseOrderItem) => purchaseOrderItem.purchaseOrder,
    {
      cascade: ['insert', 'update'],
    },
  )
  purchaseOrderItems: PurchaseOrderItem[];
}
