import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { TypeClient, TypeCurrency, TypeIdentity } from 'src/enums';

export class SelectedActivityDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  mobile: string;

  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TypeIdentity, {
    message: `Tipo cédula no es valido, debe ser ${Object.values(TypeIdentity).join(', ')}`,
  })
  identityType: string;

  @IsOptional()
  @IsString()
  currency: string = TypeCurrency.USD;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(TypeClient, {
    message: 'Tipos de contacto solo CLIENTE o PROVEEDOR',
  })
  type?: string;

  @IsString()
  @IsOptional()
  defaultSeller?: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SelectedActivityDto)
  activities: SelectedActivityDto[];
}

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  isActive?: string;

  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
