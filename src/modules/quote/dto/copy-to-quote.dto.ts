import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CopyToQuoteDto {
  @IsString()
  @IsNotEmpty()
  createdAt: string;
}

export class CreateInvoiceFromQuoteDto {
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsOptional()
  markAsInvoiced: boolean | null;
}
