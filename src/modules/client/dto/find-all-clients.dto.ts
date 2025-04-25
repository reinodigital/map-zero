import { IsOptional, IsString } from 'class-validator';
import { SimplePaginationDto } from 'src/modules/shared/dto/simple_pagination.dto';

export class FindAllClientsDto extends SimplePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  identity?: string;
}
