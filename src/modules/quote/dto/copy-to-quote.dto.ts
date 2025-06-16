import { IsNotEmpty, IsString } from 'class-validator';

export class CopyToQuoteDto {
  @IsString()
  @IsNotEmpty()
  createdAt: string;
}
