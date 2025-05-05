import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTrackingDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  executedAt: string;

  @IsString()
  @IsNotEmpty()
  executedBy: string;

  @IsNotEmpty()
  refEntity: string;

  @IsNumber()
  @IsNotEmpty()
  refEntityId: number;
}
