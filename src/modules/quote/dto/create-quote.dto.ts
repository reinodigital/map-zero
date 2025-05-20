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

export class EmailQuoteDto {
  @IsString()
  @IsNotEmpty()
  sentAt: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  emails: string[];

  @IsOptional()
  subject: string = 'Correo de cotización';

  @IsOptional()
  message: string =
    `Hola, se le adjunta en este correo el PDF de cotización.\n\nGracias, saludos.`;
}

export class ClientQuoteDto {
  @IsPositive()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class QuoteItemDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  itemId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  sellerUid: number | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  discount: number = 0;

  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  taxRate?: string;
}
export class QuoteDto {
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsNotEmpty()
  client: ClientQuoteDto;

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

  @IsString()
  @IsNotEmpty()
  action: string;
}

// CREATE
export class CreateQuoteDto {
  @IsNotEmpty()
  @Type(() => QuoteDto)
  quote: QuoteDto;
}

// UPDATE
export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @IsString()
  @IsNotEmpty()
  action: string;
}
