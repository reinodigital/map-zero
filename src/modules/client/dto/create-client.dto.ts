import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TypeClient, TypeCurrency, TypeIdentity } from 'src/enums';

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
