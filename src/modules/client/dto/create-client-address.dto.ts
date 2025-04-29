import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientAddressDto {
  @IsString()
  @IsNotEmpty()
  provinceName: string;

  @IsString()
  @IsNotEmpty()
  provinceCode: string;

  @IsString()
  @IsNotEmpty()
  cantonName: string;

  @IsString()
  @IsNotEmpty()
  cantonCode: string;

  @IsString()
  @IsNotEmpty()
  districtName: string;

  @IsString()
  @IsNotEmpty()
  districtCode: string;

  @IsOptional()
  @IsString()
  exactAddress?: string;
}
