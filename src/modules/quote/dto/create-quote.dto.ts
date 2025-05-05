import { PartialType } from '@nestjs/mapped-types';

export class CreateQuoteDto {}

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {}
