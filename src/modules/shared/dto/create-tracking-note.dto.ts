import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { NameEntities } from 'src/enums';

export class CreateTrackingNoteDto {
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(NameEntities, {
    message: `Nombre entidad invalida. Las entidades permitidas por el momento son solo estas ${Object.values(NameEntities)}`,
  })
  refEntity: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  refEntityId: number;
}
