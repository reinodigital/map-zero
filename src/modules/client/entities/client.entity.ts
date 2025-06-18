import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Activity } from 'src/modules/economic-activities/entities/activity.entity';
import { ClientAddress } from './client-address.entity';
import { ClientContact } from './client-contact.entity';
import { Quote } from 'src/modules/quote/entities/quote.entity';
import { Invoice } from 'src/modules/invoice/entities/invoice.entity';

import { TypeClient, TypeCurrency, TypeIdentity } from 'src/enums';

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

  @Column({ length: 16, nullable: false, default: TypeClient.CLIENT })
  type: string; // CLIENT | PROVIDER

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ length: 16, nullable: false, default: TypeCurrency.USD })
  currency: string;

  @Column({ nullable: true, default: null })
  notes?: string;

  @Column({ nullable: true, default: null })
  defaultSeller?: string;

  @OneToMany(() => ClientAddress, (address) => address.client, {
    cascade: ['insert', 'update'],
  })
  addresses?: ClientAddress[];

  @OneToMany(() => ClientContact, (contact) => contact.client, {
    cascade: ['insert', 'update'],
  })
  contacts?: ClientContact[];

  @OneToMany(() => Quote, (quote) => quote.client)
  quotes?: Quote[];

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices?: Invoice[];

  @ManyToMany(() => Activity, (activity) => activity.clients)
  @JoinTable({
    name: 'client_activity', // Name of the junction table
    joinColumn: {
      name: 'clientId', // Name of the column referencing Client entity
      referencedColumnName: 'id', // Name of the referenced column in Client entity
    },
    inverseJoinColumn: {
      name: 'activityId', // Name of the column referencing Activity entity
      referencedColumnName: 'id', // Name of the referenced column in Activity entity
    },
  })
  activities: Activity[];
}
