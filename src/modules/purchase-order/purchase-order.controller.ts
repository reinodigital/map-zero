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
import { PurchaseOrderService } from './purchase-order.service';

import {
  CreatePurchaseOrderDto,
  EmailPurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/create-purchase-order.dto';
import { FindAllPurchaseOrdersDto } from './dto/find-all-purchase-orders.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { ListDataUser } from 'src/enums';

@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post('send-email/:purchaseOrderId')
  @AuthDecorator()
  async sendEmail(
    @Param('purchaseOrderId', ParseIntPipe) purchaseOrderId: string,
    @Body() emailPurchaseOrderDto: EmailPurchaseOrderDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.sendEmailPurchaseOrder(
      +purchaseOrderId,
      emailPurchaseOrderDto,
      userName,
    );
  }

  @Post()
  @AuthDecorator()
  create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.create(createPurchaseOrderDto, userName);
  }

  @Get('generate-pdf/:purchaseOrderId')
  @AuthDecorator()
  async generatePDF(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Res() response: Response,
  ) {
    const pdfDoc =
      await this.purchaseOrderService.generatePDF(+purchaseOrderId);

    response.setHeader('Content-Type', 'application/pdf');

    pdfDoc.info.Title = 'Orden de Compra';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get()
  @AuthDecorator()
  findAll(@Query() findAllPurchaseOrdersDto: FindAllPurchaseOrdersDto) {
    return this.purchaseOrderService.findAll(findAllPurchaseOrdersDto);
  }

  @Get(':id')
  @AuthDecorator()
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(+id);
  }

  /* Mark Purchase Orders */
  @Patch('mark-as-sent/:id')
  @AuthDecorator()
  markAsSent(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.markAsSent(
      +id,
      updatePurchaseOrderStatusDto,
      userName,
    );
  }

  @Patch('mark-as-accepted/:id')
  @AuthDecorator()
  markAsAccepted(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.markAsAccepted(
      +id,
      updatePurchaseOrderStatusDto,
      userName,
    );
  }

  @Patch('mark-as-declined/:id')
  @AuthDecorator()
  markAsDeclined(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.markAsDeclined(
      +id,
      updatePurchaseOrderStatusDto,
      userName,
    );
  }

  // @Patch('mark-as-invoiced/:id')
  // @AuthDecorator()
  // markAsInvoiced(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
  //   @GetUser(ListDataUser.name) userName: string,
  // ) {
  //   return this.purchaseOrderService.markAsInvoiced(
  //     +id,
  //     updatePurchaseOrderStatusDto,
  //     userName,
  //   );
  // }
  /* End Mark Purchase Orders */

  /* UnMark Purchase Orders */
  @Patch('undo-mark-as-accepted/:id')
  @AuthDecorator()
  undoMarkAsAccepted(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.unMarkAsAccepted(
      +id,
      updatePurchaseOrderStatusDto,
      userName,
    );
  }

  @Patch('undo-mark-as-declined/:id')
  @AuthDecorator()
  undoMarkAsDeclined(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.unMarkAsDeclined(
      +id,
      updatePurchaseOrderStatusDto,
      userName,
    );
  }

  // @Patch('undo-mark-as-invoiced/:id')
  // @AuthDecorator()
  // undoMarkAsInvoiced(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
  //   @GetUser(ListDataUser.name) userName: string,
  // ) {
  //   return this.purchaseOrderService.unMarkAsInvoiced(
  //     +id,
  //     updatePurchaseOrderStatusDto,
  //     userName,
  //   );
  // }
  /* END UnMark Purchase Orders */

  @Patch(':id')
  @AuthDecorator()
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.update(
      +id,
      updatePurchaseOrderDto,
      userName,
    );
  }

  @Delete(':id')
  @AuthDecorator()
  remove(
    @Param('id') id: string,
    @Query('removedAt') removedAt: string,
    @GetUser(ListDataUser.name) userName: string,
  ) {
    return this.purchaseOrderService.remove(+id, removedAt, userName);
  }
}
