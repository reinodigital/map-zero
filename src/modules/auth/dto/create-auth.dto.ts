import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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
  @IsOptional()
  @IsString({ each: true })
  roles: string[];
}

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
