import { TypeCurrency, TypeIdentity } from 'src/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'timestamp',
    transformer: {
      to: (value: string) => new Date(value),
      from: (value: Date) => value,
    },
  })
  createdAt: Date;

  @Column({ length: 64, nullable: false, unique: true })
  email: string;

  @Column({ length: 16, nullable: false })
  mobile: string;

  @Column({ length: 32, nullable: false })
  identity: string;

  @Column({ length: 16, nullable: false, default: TypeIdentity.JURIDICO })
  identityType: string;

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ length: 16, nullable: false, default: TypeCurrency.USD })
  currency: string;

  @Column({ nullable: true, default: null })
  notes?: string;

  @Column({ nullable: true, default: null })
  defaultSeller?: string;
}
