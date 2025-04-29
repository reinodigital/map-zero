import { Type } from 'class-transformer';
import { IsPositive } from 'class-validator';

export class GetDistrictByCantonDto {
  @IsPositive()
  @Type(() => Number) // converts query parameter string passed from Frontend to number here
  cantonId: number;
}
