import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Account } from 'src/modules/accounting/entities/account.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { PurchaseOrder } from './purchase-order.entity';

import { DecimalTransformer } from 'src/modules/shared/transformers/decimal-value.transformer';

@Entity('purchase_order_item')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  description?: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: new DecimalTransformer(),
  })
  price: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  discount: number = 0;

  @ManyToOne(() => Account, (account) => account.purchaseOrderItems, {
    nullable: false,
  })
  account: Account;

  @Column({ nullable: true, default: null })
  taxRate?: string; // it will be the label of type of IVA

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: new DecimalTransformer(),
  })
  amount: number; // calculation with discount and IVA

  /* RELATIONS */
  @ManyToOne(() => Item, (item) => item.purchaseOrderItems, {
    nullable: false,
  })
  item: Item;

  @ManyToOne(() => Auth, (auth) => auth.purchaseOrderItems, { nullable: true })
  seller?: Auth | null;

  @ManyToOne(
    () => PurchaseOrder,
    (purchaseOrder) => purchaseOrder.purchaseOrderItems,
    {
      nullable: false,
    },
  )
  purchaseOrder: PurchaseOrder;
}
