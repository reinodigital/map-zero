import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateInvoiceStatusDto {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
