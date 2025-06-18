import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from 'src/modules/client/entities/client.entity';

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string; // activity name

  @Column({ type: 'text', nullable: false })
  description: string; // activity description

  @ManyToMany(() => Client, (client) => client.activities)
  clients: Client[];
}
