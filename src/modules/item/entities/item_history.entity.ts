import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';

// to track all modifications on items
@Entity('item_history')
export class ItemHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false })
  action: string; // created | updated | removed

  @Column({
    type: 'timestamp',
    nullable: false,
    transformer: {
      to: (value: string) => new Date(value),
      from: (value: Date) => value,
    },
  })
  executedAt: Date;

  @Column({ length: 64, nullable: true, default: null })
  executedBy?: string; // author who modified it

  @Column({ nullable: false })
  description: string; // example: "2025-30-05 Jennifer created this item"

  @ManyToOne(() => Item, (item) => item.itemHistory, {
    nullable: false,
  })
  item: Item;
}
