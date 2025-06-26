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
import { StatusPurchaseOrder, TypeCurrency } from 'src/enums';

export class EmailPurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  sentAt: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  emails: string[];

  @IsOptional()
  subject: string = 'Correo de orden de compra';

  @IsOptional()
  message: string =
    `Hola, se le adjunta en este correo el PDF de orden de compra.\n\nGracias, saludos.`;
}

export class ClientPurchaseOrderDto {
  @IsPositive()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class PurchaseOrderItemDto {
  @IsOptional()
  id?: number;

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

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  accountId: number;

  @IsString()
  taxRate?: string;
}
export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsNotEmpty()
  client: ClientPurchaseOrderDto;

  @IsString()
  @IsNotEmpty()
  @IsEnum(StatusPurchaseOrder, {
    message: `Estados permitidos de una Orden de compra son solo estos: ${Object.values(StatusPurchaseOrder).join(', ')}`,
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
  terms?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  purchaseOrderItems: PurchaseOrderItemDto[];

  @IsString()
  @IsNotEmpty()
  action: string;
}

// UPDATE
export class UpdatePurchaseOrderDto extends PartialType(
  CreatePurchaseOrderDto,
) {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
