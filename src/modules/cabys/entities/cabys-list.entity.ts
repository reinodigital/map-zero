import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  // @OneToMany(() => Product, (product) => product.cabys)
  // products: Product[];
}
