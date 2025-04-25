import { Auth } from 'src/modules/auth/entities/auth.entity';

export interface ICountAndAuthAll {
  count: number;
  users: Auth[];
}
