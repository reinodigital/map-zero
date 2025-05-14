import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateQuoteStatusDto {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
