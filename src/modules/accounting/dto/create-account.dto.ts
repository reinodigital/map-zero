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

export class CreateAccountDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  accountTypeId: number;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(TaxRateCode, {
    message: `Los valores/códigos de impuestos del IVA permitidos por hacienda son los siguientes: [${Object.values(TaxRateCode).join(', ')}]`,
  })
  tax?: string;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
