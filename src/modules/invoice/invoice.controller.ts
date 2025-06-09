import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { InvoiceService } from './invoice.service';
import { AuthDecorator, GetUser } from '../auth/decorators';

import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
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
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Patch(':id')
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
