import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

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

  @IsString()
  @IsPositive()
  costPrice: number;

  @IsString()
  @IsNotEmpty()
  purchaseAccount: string;

  @IsString()
  @IsNotEmpty()
  purchaseTaxRate: string;

  @IsString()
  @IsOptional()
  purchaseDescription: string;

  @IsString()
  @IsPositive()
  salePrice: number;

  @IsString()
  @IsNotEmpty()
  saleAccount: string;

  @IsString()
  @IsNotEmpty()
  saleTaxRate: string;

  @IsString()
  @IsOptional()
  saleDescription: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
