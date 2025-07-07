import { Controller, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';

import { InvoiceActionsService } from './invoice-actions.service';
import { AuthDecorator, GetUser } from '../auth/decorators';

import { ListDataUser } from 'src/enums';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@Controller('invoice-actions')
export class InvoiceActionsController {
  constructor(private readonly invoiceActionsService: InvoiceActionsService) {}

  @Patch('mark-as-sent/:id')
  @AuthDecorator()
  markAsSent(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceActionsService.markAsSent(
      +id,
      updateInvoiceStatusDto,
      userName,
    );
  }

  @Patch('mark-as-awaiting-approval/:id')
  @AuthDecorator()
  markAsAwaitingApproval(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceActionsService.markAsAwaitingApproval(
      +id,
      updateInvoiceStatusDto,
      userName,
    );
  }

  @Patch('mark-as-awaiting-payment/:id')
  @AuthDecorator()
  markAsAwaitingPayment(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceActionsService.markAsAwaitingPayment(
      +id,
      updateInvoiceStatusDto,
      userName,
    );
  }

  @Patch('mark-as-paid/:id')
  @AuthDecorator()
  markAsPaid(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.invoiceActionsService.markAsPaid(
      +id,
      updateInvoiceStatusDto,
      userName,
    );
  }
}
