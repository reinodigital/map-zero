import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AccountTypeCategory } from 'src/enums/account.enum';

export class CreateAccountTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AccountTypeCategory, {
    message: `Categorías de tipo de cuentas permitidas son las siguientes: [${Object.values(AccountTypeCategory).join(', ')}]`,
  })
  category: string;
}

export class UpdateAccountTypeDto extends PartialType(CreateAccountTypeDto) {}
