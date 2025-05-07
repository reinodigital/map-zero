import { IsOptional, IsString } from 'class-validator';
import { SimplePaginationDto } from 'src/modules/shared/dto/simple_pagination.dto';

export class FindAllQuotesDto extends SimplePaginationDto {
  @IsOptional()
  @IsString()
  quoteNumber?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
