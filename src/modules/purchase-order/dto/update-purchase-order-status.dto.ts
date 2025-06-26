import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePurchaseOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
