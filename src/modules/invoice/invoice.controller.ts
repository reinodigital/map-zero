import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { InvoiceService } from './invoice.service';
import { AuthDecorator, GetUser } from '../auth/decorators';

import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { FindAllInvoicesDto } from './dto/find-all-invoices.dto';
import { ListDataUser } from 'src/enums';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @AuthDecorator()
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceService.create(createInvoiceDto, userName);
  }

  @Get()
  @AuthDecorator()
  findAll(@Query() findAllInvoicesDto: FindAllInvoicesDto) {
    return this.invoiceService.findAll(findAllInvoicesDto);
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Patch(':id')
  @AuthDecorator()
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceService.update(+id, updateInvoiceDto, userName);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.invoiceService.remove(+id);
  }
}
