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
import { StatusInvoice, TypeCurrency } from 'src/enums';

export class EmailInvoiceDto {
  @IsString()
  @IsNotEmpty()
  sentAt: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  emails: string[];

  @IsOptional()
  subject: string = 'Correo de facturación';

  @IsOptional()
  message: string =
    `Hola, se le adjunta en este correo el PDF de facturación.\n\nGracias, saludos.`;
}

export class ClientInvoiceDto {
  @IsPositive()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class InvoiceItemDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  itemId: number;

  //   @IsOptional()
  //   @IsNumber()
  //   @IsPositive()
  //   sellerUid: number | null;

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

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  accountId: number;

  @IsString()
  taxRate?: string;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsNotEmpty()
  client: ClientInvoiceDto;

  @IsArray()
  @ArrayMinSize(0)
  receptorActivities: string[];

  @IsString()
  @IsNotEmpty()
  @IsEnum(StatusInvoice, {
    message: `Estados permitidos de una Factura son solo estos: [${Object.values(StatusInvoice).join(', ')}]`,
  })
  status: string;

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
  reference?: string; // maybe QU-XXX

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  invoiceItems: InvoiceItemDto[];

  @IsString()
  @IsNotEmpty()
  action: string;
}

// UPDATE
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
