import { IsOptional, IsString } from 'class-validator';
import { SimplePaginationDto } from 'src/modules/shared/dto/simple_pagination.dto';

export class FindAllPurchaseOrdersDto extends SimplePaginationDto {
  @IsOptional()
  @IsString()
  purchaseOrderNumber?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
