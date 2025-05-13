import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';
import { SecurityRoles } from 'src/enums';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, unique: true })
  mobile: string;

  @Column({ nullable: false })
  password: string;

  @Column({ length: 128, nullable: true, default: null })
  token?: string;

  @Column({
    type: 'simple-array',
    nullable: false,
    default: SecurityRoles.SELLER,
  })
  roles: string[];

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  /* Relations */
  @OneToMany(() => QuoteItem, (quoteItem) => quoteItem.seller)
  quoteItems: QuoteItem[];
}
