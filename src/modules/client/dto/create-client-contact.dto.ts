import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateClientContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  mobile?: string;
}
