import { IsIn, IsOptional, IsString } from 'class-validator';
import { SimplePaginationDto } from 'src/modules/shared/dto/simple_pagination.dto';

export class FindAllUsersDto extends SimplePaginationDto {
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
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
