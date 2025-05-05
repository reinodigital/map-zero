import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveClientContactAddressDto {
  @IsString()
  @IsNotEmpty()
  removedAt: string;
}
