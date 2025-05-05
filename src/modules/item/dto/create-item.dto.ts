import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TaxRateCode } from 'src/enums';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsNotEmpty()
  cabys: string;

  @IsNumber()
  @IsPositive()
  costPrice: number;

  @IsString()
  @IsNotEmpty()
  purchaseAccount: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TaxRateCode, {
    message: `Valor de tasa de impuestos permitidos solo estos: [${Object.values(TaxRateCode)}]`,
  })
  purchaseTaxRate: string;

  @IsString()
  @IsOptional()
  purchaseDescription?: string;

  @IsNumber()
  @IsPositive()
  salePrice: number;

  @IsString()
  @IsNotEmpty()
  saleAccount: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TaxRateCode, {
    message: `Valor de tasa de impuestos permitidos solo estos: ${Object.values(TaxRateCode).join(', ')}`,
  })
  saleTaxRate: string;

  @IsString()
  @IsOptional()
  saleDescription?: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
