import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { District } from './district.entity';
import { Province } from './province.entity';

@Entity('territory_canton')
export class Canton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 84, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  code: number;

  @OneToMany(() => District, (dist) => dist.canton, { cascade: ['insert'] })
  districts: District[];

  @ManyToOne(() => Province, (prov) => prov.cantons)
  province: Province;
}
