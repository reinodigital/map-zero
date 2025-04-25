import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class SimplePaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // converts query parameter string to number here
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number) // converts query parameter string to number here
  offset?: number;
}
