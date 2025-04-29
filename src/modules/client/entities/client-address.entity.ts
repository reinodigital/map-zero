import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_address')
export class ClientAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, nullable: false })
  provinceName: string;

  @Column({ length: 16, nullable: false })
  provinceCode: string;

  @Column({ length: 64, nullable: false })
  cantonName: string;

  @Column({ length: 16, nullable: false })
  cantonCode: string;

  @Column({ length: 64, nullable: false })
  districtName: string;

  @Column({ length: 16, nullable: false })
  districtCode: string;

  @Column({ type: 'text', nullable: true, default: null })
  exactAddress?: string;

  @ManyToOne(() => Client, (client) => client.addresses, { nullable: false })
  client: Client;
}
