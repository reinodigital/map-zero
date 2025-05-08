import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { AuthDecorator, GetUser } from '../auth/decorators';
import { QuoteService } from './quote.service';

import { CreateQuoteDto, UpdateQuoteDto } from './dto/create-quote.dto';
import { FindAllQuotesDto } from './dto/find-all-quotes.dto';
import { ListDataUser, SecurityRoles } from 'src/enums';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.create(createQuoteDto, userName);
  }

  @Get()
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  findAll(@Query() findAllQuotesDto: FindAllQuotesDto) {
    return this.quoteService.findAll(findAllQuotesDto);
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quoteService.update(+id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quoteService.remove(+id);
  }
}
