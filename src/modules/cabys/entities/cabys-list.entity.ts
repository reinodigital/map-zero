import { Item } from 'src/modules/item/entities/item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cabys_list')
export class CabysList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false })
  code: string;

  @Column({ type: 'text', nullable: false })
  description: string; // `code + IVA + description`

  @Column({ nullable: false })
  tax: number; // percentage IVA

  @OneToMany(() => Item, (item) => item.cabys)
  items: Item[];
}
