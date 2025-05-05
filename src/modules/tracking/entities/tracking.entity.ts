import { ActionOverEntity } from 'src/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// to track all modifications on all tables
@Entity('tracking')
export class Tracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false, default: ActionOverEntity.CREATED })
  action: string;

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
  detail: string;

  // References
  @Column({ nullable: false })
  refEntity: string; // Table name

  @Column({ nullable: false })
  refEntityId: number; // Row table by id
}
