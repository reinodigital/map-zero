import { CabysList } from 'src/modules/cabys/entities/cabys-list.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemHistory } from './item_history.entity';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string; // could be product or service code, example: "N454LEN56"

  @ManyToOne(() => CabysList, (cabys) => cabys.items, { nullable: false })
  cabys: CabysList;

  // Purchase fields
  @Column({ type: 'float', nullable: false })
  costPrice: number;

  @Column({ nullable: false })
  purchaseAccount: string; // select field example: "300 - Costo de Ventas Mercadería"

  @Column({ nullable: false })
  purchaseTaxRate: string; // select field example: "Tarifa General 13%"

  @Column({ type: 'text', nullable: true, default: null })
  purchaseDescription?: string;
  // END Purchase fields

  // Sell fields
  @Column({ type: 'float', nullable: false })
  salePrice: number;

  @Column({ nullable: false })
  saleAccount: string; // select field example: "200 -  523601 Ventas de Mercadería"

  @Column({ nullable: false })
  saleTaxRate: string; // select field example: "Tarifa General 13%"

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

  @OneToMany(() => ItemHistory, (itemHistory) => itemHistory.item, {
    cascade: ['insert'],
  })
  itemHistory: ItemHistory[];
}
