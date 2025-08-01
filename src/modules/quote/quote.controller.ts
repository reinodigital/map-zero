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
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import {
  CopyToQuoteDto,
  CreateInvoiceFromQuoteDto,
} from './dto/copy-to-quote.dto';
import { ListDataUser } from 'src/enums';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post('send-email/:quoteId')
  @AuthDecorator()
  async sendEmail(
    @Param('quoteId', ParseIntPipe) quoteId: string,
    @Body() emailQuoteDto: EmailQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.sendEmailQuote(+quoteId, emailQuoteDto, userName);
  }

  // it is called from two places at frontend 1- copyTo action modal-user select Invoice 2-an accepted quote is wanted to be invoiced
  @Post('copy-to-invoice/:quoteId')
  @AuthDecorator()
  copyToInvoice(
    @Param('quoteId', ParseIntPipe) quoteId: string,
    @Body() createInvoiceFromQuoteDto: CreateInvoiceFromQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.copyToInvoice(
      +quoteId,
      userName,
      createInvoiceFromQuoteDto,
    );
  }

  @Post('copy-to-draft/:quoteId')
  @AuthDecorator()
  copyToQuote(
    @Param('quoteId', ParseIntPipe) quoteId: string,
    @Body() copyToQuoteDto: CopyToQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.copyToDraftQuote(
      +quoteId,
      userName,
      copyToQuoteDto.createdAt,
    );
  }

  @Post()
  @AuthDecorator()
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.create(createQuoteDto, userName);
  }

  @Get('generate-pdf/:quoteId')
  @AuthDecorator()
  async generatePDF(
    @Param('quoteId') quoteId: string,
    @Res() response: Response,
  ) {
    const pdfDoc = await this.quoteService.generatePDF(+quoteId);

    response.setHeader('Content-Type', 'application/pdf');

    pdfDoc.info.Title = `Cotización-${quoteId}`;
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get()
  @AuthDecorator()
  findAll(@Query() findAllQuotesDto: FindAllQuotesDto) {
    return this.quoteService.findAll(findAllQuotesDto);
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(+id);
  }

  /* Mark Quotes */
  @Patch('mark-as-sent/:id')
  @AuthDecorator()
  markAsSent(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.markAsSent(+id, updateQuoteStatusDto, userName);
  }

  @Patch('mark-as-accepted/:id')
  @AuthDecorator()
  markAsAccepted(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.markAsAccepted(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }

  @Patch('mark-as-declined/:id')
  @AuthDecorator()
  markAsDeclined(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.markAsDeclined(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }

  @Patch('mark-as-invoiced/:id')
  @AuthDecorator()
  markAsInvoiced(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.markAsInvoiced(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }
  /* End Mark Quotes */

  /* UnMark Quotes */
  @Patch('undo-mark-as-accepted/:id')
  @AuthDecorator()
  undoMarkAsAccepted(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.unMarkAsAccepted(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }

  @Patch('undo-mark-as-declined/:id')
  @AuthDecorator()
  undoMarkAsDeclined(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.unMarkAsDeclined(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }

  @Patch('undo-mark-as-invoiced/:id')
  @AuthDecorator()
  undoMarkAsInvoiced(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.unMarkAsInvoiced(
      +id,
      updateQuoteStatusDto,
      userName,
    );
  }
  /* END UnMark Quotes */

  @Patch(':id')
  @AuthDecorator()
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.update(+id, updateQuoteDto, userName);
  }

  @Delete(':id')
  @AuthDecorator()
  remove(
    @Param('id') id: string,
    @Query('removedAt') removedAt: string,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.quoteService.remove(+id, removedAt, userName);
  }
}
