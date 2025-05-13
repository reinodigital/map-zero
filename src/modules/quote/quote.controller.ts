import { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  ParseIntPipe,
} from '@nestjs/common';

import { AuthDecorator, GetUser } from '../auth/decorators';
import { QuoteService } from './quote.service';

import {
  CreateQuoteDto,
  EmailQuoteDto,
  UpdateQuoteDto,
} from './dto/create-quote.dto';
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

  @Post('/send-email/:quoteId')
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  async sendEmail(
    @Param('quoteId', ParseIntPipe) quoteId: string,
    @Body() emailQuoteDto: EmailQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.sendEmailQuote(+quoteId, emailQuoteDto, userName);
  }

  @Get('/generate-pdf/:quoteId')
  @AuthDecorator(
    SecurityRoles.SUPER_ADMIN,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
  )
  async generatePDF(
    @Param('quoteId') quoteId: string,
    @Res() response: Response,
  ) {
    const pdfDoc = await this.quoteService.generatePDF(+quoteId);

    response.setHeader('Content-Type', 'application/pdf');

    pdfDoc.info.Title = 'Cotización';
    pdfDoc.pipe(response);
    pdfDoc.end();
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
