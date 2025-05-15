import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateAccountTypeDto extends PartialType(CreateAccountTypeDto) {}
