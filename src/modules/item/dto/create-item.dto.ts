import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
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

  // PURCHASE
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @Type(() => Number)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  purchaseAccountId?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(TaxRateCode, {
    message: `Valor de tasa de impuestos permitidos solo estos: [${Object.values(TaxRateCode)}]`,
  })
  purchaseTaxRate?: string;

  @IsOptional()
  @IsString()
  purchaseDescription?: string;

  // SALES
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @Type(() => Number)
  salePrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  saleAccountId: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(TaxRateCode, {
    message: `Valor de tasa de impuestos permitidos solo estos: ${Object.values(TaxRateCode).join(', ')}`,
  })
  saleTaxRate: string;

  @IsOptional()
  @IsString()
  saleDescription?: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
