import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_contact')
export class ClientContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, nullable: false })
  name: string;

  @Column({ nullable: true, default: null })
  lastName?: string;

  @Column({ nullable: true, default: null })
  email?: string;

  @Column({ nullable: true, default: null })
  mobile?: string;

  @ManyToOne(() => Client, (client) => client.contacts, { nullable: false })
  client: Client;
}
