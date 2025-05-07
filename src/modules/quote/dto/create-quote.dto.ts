import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { StatusQuote, TypeCurrency } from 'src/enums';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(StatusQuote, {
    message: `Estados permitidos de una Cotización son solo estos: ${Object.values(StatusQuote).join(', ')}`,
  })
  status: string;

  // @IsString()
  // @IsNotEmpty()
  // quoteNumber: string;

  @IsOptional()
  @IsString()
  initDate?: string;

  @IsOptional()
  @IsString()
  expireDate?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TypeCurrency, {
    message: `Monedas permitidas solo estas: ${Object.values(TypeCurrency).join(', ')}`,
  })
  currency: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  quoteItems: QuoteItemDto[];
}

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {}

export class QuoteItemDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  itemId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  discount: number = 0;

  @IsString()
  account?: string;

  @IsString()
  taxRate?: string;
}
