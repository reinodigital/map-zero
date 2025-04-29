import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Canton } from './canton.entity';

@Entity('territory_province')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 84, unique: true, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  code: number;

  @OneToMany(() => Canton, (canton) => canton.province, { cascade: ['insert'] })
  cantons: Canton[];
}
