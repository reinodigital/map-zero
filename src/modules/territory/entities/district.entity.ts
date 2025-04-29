import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Canton } from './canton.entity';

@Entity('territory_district')
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 84, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  code: number;

  @ManyToOne(() => Canton, (canton) => canton.districts)
  canton: Canton;
}
