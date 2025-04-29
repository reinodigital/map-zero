import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { SecurityRoles } from 'src/enums';

export class CreateAuthDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(8)
  mobile: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SecurityRoles, { each: true })
  roles: string[];
}

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
