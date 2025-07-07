import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from './entities/invoice.entity';
import { TrackingService } from '../tracking/tracking.service';

import { ActionOverEntity, NameEntities, StatusInvoice } from 'src/enums';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { IMessage } from 'src/interfaces';

@Injectable()
export class InvoiceActionsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    private readonly trackingService: TrackingService,
  ) {}

  async markAsSent(
    invoiceId: number,
    updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateInvoiceStatusDto;

    const invoice = await this.invoiceRepository.findOneBy({
      id: invoiceId,
    });
    if (!invoice) {
      throw new NotFoundException(`Factura con ID: ${invoice} no encontrada.`);
    }

    if (invoice.status === StatusInvoice.SENT) {
      return {
        msg: `Factura ${invoice.invoiceNumber} ya estaba con estado enviada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsSent = [StatusInvoice.DRAFT];

    if (!allowedStatusToMarkAsSent.includes(invoice.status as StatusInvoice)) {
      throw new BadRequestException(
        `No se permite marcar factura como enviada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsSent.join(', ')}]`,
      );
    }

    await this.invoiceRepository.update(
      { id: invoiceId },
      { status: StatusInvoice.SENT },
    );

    // generate tracking
    const invoiceTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.SENT,
      updatedAt,
      `Factura ${invoice.invoiceNumber} marcada como enviada`,
      invoice,
    );
    await this.trackingService.create(invoiceTrackingDto);

    return {
      msg: `Factura ${invoice.invoiceNumber} marcada como enviada correctamente.`,
    };
  }

  // WORKFLOW STEP 1 - AWAITING APPROVAL
  async markAsAwaitingApproval(
    invoiceId: number,
    updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateInvoiceStatusDto;

    const invoice = await this.invoiceRepository.findOneBy({
      id: invoiceId,
    });
    if (!invoice) {
      throw new NotFoundException(
        `Factura con ID: ${invoiceId} no encontrada.`,
      );
    }

    if (invoice.status === StatusInvoice.AWAITING_APPROVAL) {
      return {
        msg: `Factura ${invoice.invoiceNumber} ya estaba con estado esperando ser aprobada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsAwaitingForApproval = [
      StatusInvoice.DRAFT,
      StatusInvoice.SENT,
    ];

    if (
      !allowedStatusToMarkAsAwaitingForApproval.includes(
        invoice.status as StatusInvoice,
      )
    ) {
      throw new BadRequestException(
        `No se permite marcar factura como esperando ser aprobada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsAwaitingForApproval.join(', ')}]`,
      );
    }

    await this.invoiceRepository.update(
      { id: invoiceId },
      { status: StatusInvoice.AWAITING_APPROVAL },
    );

    // generate tracking
    const invoiceTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.AWAITING_FOR_APPROVAL,
      updatedAt,
      `Factura ${invoice.invoiceNumber} marcada como esperando por aprobación`,
      invoice,
    );
    await this.trackingService.create(invoiceTrackingDto);

    return {
      msg: `Factura ${invoice.invoiceNumber} marcada como esperando por aprobación correctamente.`,
    };
  }

  // STEP 2: AWAITING_PAYMENT action is approved
  async markAsAwaitingPayment(
    invoiceId: number,
    updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateInvoiceStatusDto;

    const invoice = await this.invoiceRepository.findOneBy({
      id: invoiceId,
    });
    if (!invoice) {
      throw new NotFoundException(
        `Factura con ID: ${invoiceId} no encontrada.`,
      );
    }

    if (invoice.status === StatusInvoice.AWAITING_PAYMENT) {
      return {
        msg: `Factura ${invoice.invoiceNumber} ya estaba con estado esperando por pago anteriormente.`,
      };
    }

    const allowedStatusToMarkAsAwaitingForPayment = [
      StatusInvoice.DRAFT,
      StatusInvoice.SENT,
      StatusInvoice.AWAITING_APPROVAL,
    ];

    if (
      !allowedStatusToMarkAsAwaitingForPayment.includes(
        invoice.status as StatusInvoice,
      )
    ) {
      throw new BadRequestException(
        `No se permite marcar factura como esperando por pago si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsAwaitingForPayment.join(', ')}]`,
      );
    }

    await this.invoiceRepository.update(
      { id: invoiceId },
      { status: StatusInvoice.AWAITING_PAYMENT },
    );

    // generate tracking
    const invoiceTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.AWAITING_FOR_PAYMENT,
      updatedAt,
      `Factura ${invoice.invoiceNumber} marcada como esperando por pago`,
      invoice,
    );
    await this.trackingService.create(invoiceTrackingDto);

    return {
      msg: `Factura ${invoice.invoiceNumber} marcada como esperando por pago correctamente.`,
    };
  }

  // STEP 3: PAID
  async markAsPaid(
    invoiceId: number,
    updateInvoiceStatusDto: UpdateInvoiceStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateInvoiceStatusDto;

    const invoice = await this.invoiceRepository.findOneBy({
      id: invoiceId,
    });
    if (!invoice) {
      throw new NotFoundException(
        `Factura con ID: ${invoiceId} no encontrada.`,
      );
    }

    if (invoice.status === StatusInvoice.PAID) {
      return {
        msg: `Factura ${invoice.invoiceNumber} ya estaba con estado pagada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsPaid = [StatusInvoice.AWAITING_PAYMENT];

    if (!allowedStatusToMarkAsPaid.includes(invoice.status as StatusInvoice)) {
      throw new BadRequestException(
        `No se permite marcar factura como pagada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsPaid.join(', ')}]`,
      );
    }

    await this.invoiceRepository.update(
      { id: invoiceId },
      { status: StatusInvoice.PAID },
    );

    // generate tracking
    const invoiceTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.PAID,
      updatedAt,
      `Factura ${invoice.invoiceNumber} marcada como pagada`,
      invoice,
    );
    await this.trackingService.create(invoiceTrackingDto);

    return {
      msg: `Factura ${invoice.invoiceNumber} marcada como pagada correctamente.`,
    };
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    detail: string,
    invoice: Invoice,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail,
      refEntity: NameEntities.INVOICE,
      refEntityId: invoice.id,
    };

    return newTracking;
  }
}
