import { IsOptional, IsString } from 'class-validator';
import { SimplePaginationDto } from 'src/modules/shared/dto/simple_pagination.dto';

export class FindAllItemsDto extends SimplePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;
}
