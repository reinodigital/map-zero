import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Auth } from '../auth/entities/auth.entity';
import { Account } from '../accounting/entities/account.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Client } from '../client/entities/client.entity';
import { Item } from '../item/entities/item.entity';

import { PurchaseOrderItemService } from './purchase-order-item.service';
import { TrackingService } from '../tracking/tracking.service';
import { ReportService } from '../shared/services/report.service';
import { NodemailerService } from '../shared/services/nodemailer.service';
import { InvoiceService } from '../invoice/invoice.service';

import { getTaxRateValue } from '../shared/helpers/tax-rate';
import { roundToTwoDecimals } from '../shared/helpers/round-two-decimals.helper';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { FindAllPurchaseOrdersDto } from './dto/find-all-purchase-orders.dto';
import {
  EmailPurchaseOrderDto,
  PurchaseOrderItemDto,
  UpdatePurchaseOrderDto,
} from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { ActionOverEntity, NameEntities, StatusPurchaseOrder } from 'src/enums';
import {
  ICountAndPurchaseAll,
  IDetailPurchaseOrder,
  IMessage,
} from 'src/interfaces';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    private readonly purchaseOrderItemService: PurchaseOrderItemService,
    private readonly trackingService: TrackingService,
    private readonly invoiceService: InvoiceService,
    private readonly reportService: ReportService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async create(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    userName: string,
  ): Promise<PurchaseOrder> {
    const {
      createdAt,
      client: clientDto,
      purchaseOrderItems,
      status,
      action,
      ...restPurchaseOrder
    } = createPurchaseOrderDto;

    // verify exists Client
    const client = await this.clientRepository.findOneBy({
      id: clientDto.id,
    });
    if (!client) {
      throw new BadRequestException(
        `Cliente con ID: ${clientDto.id} no encontrado.`,
      );
    }

    // create purchase-order-items and amount
    const [purchaseOrderItemsEntities, totalToPay] =
      await this.createPurchaseOrderItems(purchaseOrderItems);

    // create purchase order
    const newPurchaseOrder = this.purchaseOrderRepository.create({
      client,
      purchaseOrderItems: purchaseOrderItemsEntities,
      status,
      total: roundToTwoDecimals(totalToPay),
      ...restPurchaseOrder,
    });

    const savedPurchaseOrder =
      await this.purchaseOrderRepository.save(newPurchaseOrder);

    await this.purchaseOrderRepository.update(
      { id: savedPurchaseOrder.id },
      { purchaseOrderNumber: `OC-${savedPurchaseOrder.id}` },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.CREATED,
      createdAt,
      `Orden de compra OC-${savedPurchaseOrder.id} creada con estado ${status}`,
      savedPurchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return savedPurchaseOrder;
  }

  public async sendEmailPurchaseOrder(
    purchaseOrderId: number,
    emailPurchaseOrderDto: EmailPurchaseOrderDto,
    userName: string,
  ): Promise<IMessage> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: purchaseOrderId },
      relations: {
        client: { addresses: true },
        purchaseOrderItems: { item: { cabys: true } },
      },
    });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
      );
    }

    if (!emailPurchaseOrderDto.emails || !emailPurchaseOrderDto.emails.length) {
      throw new BadRequestException(
        'Se ocupa el menos una bandeja de correo para enviar la orden de compra.',
      );
    }

    await this.nodemailerService.sendPurchaseOrderEmail(
      purchaseOrder,
      emailPurchaseOrderDto,
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.SENT,
      emailPurchaseOrderDto.sentAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} enviada por correo electrónico [${emailPurchaseOrderDto.emails.join(', ')}]`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    // verify if status purchase order is draft to update it to sent
    if (purchaseOrder.status === StatusPurchaseOrder.DRAFT) {
      await this.purchaseOrderRepository.update(
        { id: purchaseOrder.id },
        { status: StatusPurchaseOrder.SENT },
      );
    }

    return {
      msg: `Orden de compra enviada correctamente por correo electrónico.`,
    };
  }

  public async generatePDF(
    purchaseOrderId: number,
  ): Promise<PDFKit.PDFDocument> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id: purchaseOrderId },
        relations: {
          client: { addresses: true },
          purchaseOrderItems: { item: { cabys: true } },
        },
      });
      if (!purchaseOrder) {
        throw new BadRequestException(
          `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
        );
      }

      const doc =
        await this.reportService.generatePurchaseOrderPDF(purchaseOrder);

      return doc;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findAll(
    findAllPurchaseOrdersDto: FindAllPurchaseOrdersDto,
  ): Promise<ICountAndPurchaseAll> {
    const {
      limit = 10,
      offset = 0,
      status = null,
      purchaseOrderNumber = null,
    } = findAllPurchaseOrdersDto;

    const findOptions: FindManyOptions<PurchaseOrder> = {
      take: limit,
      skip: offset,
      order: {
        id: 'desc',
      },
      relations: { client: true },
    };

    const whereConditions: any = {};
    if (status) {
      whereConditions.status = status;
    }
    if (purchaseOrderNumber) {
      whereConditions.purchaseOrderNumber = Like(`%${purchaseOrderNumber}%`);
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
    }

    try {
      const [purchaseOrders, totalQuery] =
        await this.purchaseOrderRepository.findAndCount(findOptions);

      const { statusCounts, total } =
        await this.filterTotalsByPurchaseOrderStatus();

      return {
        count: totalQuery,
        purchaseOrders,
        statusCounts,
        total,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private async filterTotalsByPurchaseOrderStatus(): Promise<any> {
    try {
      const groupedStatusRaw = await this.purchaseOrderRepository
        .createQueryBuilder('purchaseOrder')
        .select('purchaseOrder.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('purchaseOrder.status')
        .getRawMany();

      // Transform array into an object
      const statusCounts: Record<string, number> = {};
      let total = 0;
      groupedStatusRaw.forEach((row) => {
        const totalByStatus = parseInt(row.count, 10);
        statusCounts[row.status] = totalByStatus;
        total += totalByStatus;
      });

      return { statusCounts, total };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findOne(id: number): Promise<IDetailPurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository
        .createQueryBuilder('purchaseOrder')
        .leftJoinAndSelect('purchaseOrder.client', 'client')
        .leftJoinAndSelect(
          'purchaseOrder.purchaseOrderItems',
          'purchaseOrderItems',
        )
        .leftJoin('purchaseOrderItems.item', 'item') // You can also use leftJoinAndSelect if needed
        .leftJoin('purchaseOrderItems.seller', 'seller')
        .leftJoin('purchaseOrderItems.account', 'account')
        .addSelect(['item.name', 'item.id']) // Only select item.name and item.id
        .addSelect(['seller.name', 'seller.uid']) // Only select seller.name and seller.uid
        .addSelect(['account.name', 'account.id', 'account.code'])
        .where('purchaseOrder.id = :id', { id })
        .getOne();

      if (!purchaseOrder) {
        throw new BadRequestException(
          `Orden de compra con ID: ${id} no encontrada.`,
        );
      }

      // fetch trackings
      const result: IDetailPurchaseOrder = {
        ...purchaseOrder,
        tracking: await this.trackingService.fetchTrackings(
          NameEntities.PURCHASE_ORDER,
          id,
        ),
      };

      return result;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async update(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    userName: string,
  ): Promise<PurchaseOrder> {
    const {
      purchaseOrderItems = [],
      client,
      updatedAt,
      ...restPurchaseOrder
    } = updatePurchaseOrderDto;
    try {
      const existingPurchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id },
        relations: { client: true, purchaseOrderItems: true },
      });

      if (!existingPurchaseOrder) {
        throw new NotFoundException(
          `Orden de compra con ID ${id} no encontrada`,
        );
      }

      const allowedStatusToEditPurchaseOrder = [
        StatusPurchaseOrder.DRAFT,
        StatusPurchaseOrder.SENT,
      ];
      if (
        !allowedStatusToEditPurchaseOrder.includes(
          existingPurchaseOrder.status as StatusPurchaseOrder,
        )
      ) {
        throw new BadRequestException(
          `Orden de compra ${existingPurchaseOrder.id} con estado ${existingPurchaseOrder.status} no permite ser editada. Para editar una orden de compra debe de presentar uno de los estados siguientes: [${allowedStatusToEditPurchaseOrder}]`,
        );
      }

      // STEP 1: verify if client changed
      let possibleNewClient: Client = existingPurchaseOrder.client;
      if (client?.id && existingPurchaseOrder.client.id !== client.id) {
        const newClient = await this.clientRepository.findOneBy({
          id: client.id,
        });
        if (!newClient) {
          throw new BadRequestException(
            `Cliente con ID: ${client.id} no encontrado.`,
          );
        }

        possibleNewClient = newClient;
      }

      // STEP 2: preload purchase order with new data
      const preloadedPurchaseOrder: PurchaseOrder | undefined =
        await this.purchaseOrderRepository.preload({
          id,
          ...restPurchaseOrder,
          client: possibleNewClient,
        });

      // STEP 3: synchronize purchase order items
      const totalToPay =
        await this.purchaseOrderItemService.syncPurchaseOrderItems(
          preloadedPurchaseOrder!,
          purchaseOrderItems,
        );

      preloadedPurchaseOrder!.total = roundToTwoDecimals(totalToPay);

      const savedPurchaseOrder = await this.purchaseOrderRepository.save(
        preloadedPurchaseOrder!,
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.EDITED,
        updatedAt,
        `Orden de compra OC-${savedPurchaseOrder.id} ha sido editada`,
        savedPurchaseOrder,
      );
      await this.trackingService.create(itemTrackingDto);

      return savedPurchaseOrder;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async remove(
    id: number,
    removedAt: string,
    userName: string,
  ): Promise<IMessage> {
    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({ id });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${id} no encontrada.`,
      );
    }

    await this.purchaseOrderRepository.update(
      { id },
      { status: StatusPurchaseOrder.REMOVED, isActive: false },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.REMOVED,
      removedAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} removida`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return {
      msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} removida correctamente.`,
    };
  }

  // WORKFLOW STEP 1
  async markAsSent(
    purchaseOrderId: number,
    updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updatePurchaseOrderStatusDto;

    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
      id: purchaseOrderId,
    });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
      );
    }

    if (purchaseOrder.status === StatusPurchaseOrder.SENT) {
      return {
        msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} ya estaba con estado enviada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsSent = [StatusPurchaseOrder.DRAFT];

    if (
      !allowedStatusToMarkAsSent.includes(
        purchaseOrder.status as StatusPurchaseOrder,
      )
    ) {
      throw new BadRequestException(
        `No se permite marcar orden de compra como enviada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsSent.join(', ')}]`,
      );
    }

    await this.purchaseOrderRepository.update(
      { id: purchaseOrderId },
      { status: StatusPurchaseOrder.SENT },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.SENT,
      updatedAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como enviada`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return {
      msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como enviada correctamente.`,
    };
  }

  // WORKFLOW STEP 2 - ACCEPTED
  async markAsAccepted(
    purchaseOrderId: number,
    updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updatePurchaseOrderStatusDto;

    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
      id: purchaseOrderId,
    });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
      );
    }

    if (purchaseOrder.status === StatusPurchaseOrder.ACCEPTED) {
      return {
        msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} ya estaba con estado aceptada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsAccepted = [StatusPurchaseOrder.SENT];

    if (
      !allowedStatusToMarkAsAccepted.includes(
        purchaseOrder.status as StatusPurchaseOrder,
      )
    ) {
      throw new BadRequestException(
        `No se permite marcar orden de compra como aceptada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsAccepted.join(', ')}]`,
      );
    }

    await this.purchaseOrderRepository.update(
      { id: purchaseOrderId },
      { status: StatusPurchaseOrder.ACCEPTED },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.ACCEPTED,
      updatedAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como aceptada`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return {
      msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como aceptada correctamente.`,
    };
  }

  // WORKFLOW STEP 2 - DECLINED
  async markAsDeclined(
    purchaseOrderId: number,
    updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updatePurchaseOrderStatusDto;

    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
      id: purchaseOrderId,
    });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
      );
    }

    if (purchaseOrder.status === StatusPurchaseOrder.DECLINED) {
      return {
        msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} ya estaba con estado rechazada anteriormente.`,
      };
    }

    const allowedStatusToMarkAsDeclined = [StatusPurchaseOrder.SENT];

    if (
      !allowedStatusToMarkAsDeclined.includes(
        purchaseOrder.status as StatusPurchaseOrder,
      )
    ) {
      throw new BadRequestException(
        `No se permite marcar orden de compra como rechazada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsDeclined.join(', ')}]`,
      );
    }

    await this.purchaseOrderRepository.update(
      { id: purchaseOrderId },
      { status: StatusPurchaseOrder.DECLINED },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.DECLINED,
      updatedAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como rechazada`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return {
      msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como rechazada correctamente.`,
    };
  }

  // WORKFLOW STEP 3
  // async markAsInvoiced(
  //   purchaseOrderId: number,
  //   updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
  //   userName: string,
  // ): Promise<IMessage> {
  //   const { updatedAt } = updatePurchaseOrderStatusDto;
  //   const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
  //     id: purchaseOrderId,
  //   });
  //   if (!purchaseOrder) {
  //     throw new BadRequestException(
  //       `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
  //     );
  //   }

  //   if (purchaseOrder.status === StatusPurchaseOrder.INVOICED) {
  //     return {
  //       msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} ya estaba con estado facturada anteriormente.`,
  //     };
  //   }

  //   const allowedStatusToMarkAsInvoiced = [StatusPurchaseOrder.ACCEPTED];

  //   if (
  //     !allowedStatusToMarkAsInvoiced.includes(
  //       purchaseOrder.status as StatusPurchaseOrder,
  //     )
  //   ) {
  //     throw new BadRequestException(
  //       `No se permite marcar orden de compra como facturada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsInvoiced.join(', ')}]`,
  //     );
  //   }

  //   await this.purchaseOrderRepository.update(
  //     { id: purchaseOrderId },
  //     { status: StatusPurchaseOrder.INVOICED },
  //   );

  //   // generate tracking
  //   const itemTrackingDto = this.generateTracking(
  //     userName,
  //     ActionOverEntity.INVOICED,
  //     updatedAt,
  //     `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como facturada`,
  //     purchaseOrder,
  //   );
  //   await this.trackingService.create(itemTrackingDto);

  //   return {
  //     msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} marcada como facturada correctamente.`,
  //   };
  // }

  /* UnMark Purchase Orders*/
  async unMarkAsAccepted(
    purchaseOrderId: number,
    updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    userName: string,
  ) {
    const { updatedAt } = updatePurchaseOrderStatusDto;
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
        id: purchaseOrderId,
      });
      if (!purchaseOrder) {
        throw new BadRequestException(
          `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
        );
      }

      const allowedStatusToUnMarkAsAccepted = [StatusPurchaseOrder.ACCEPTED];

      if (
        !allowedStatusToUnMarkAsAccepted.includes(
          purchaseOrder.status as StatusPurchaseOrder,
        )
      ) {
        throw new BadRequestException(
          `No se permite desmarcar como aceptada una orden de compra si no presenta estado: ${allowedStatusToUnMarkAsAccepted}`,
        );
      }

      await this.purchaseOrderRepository.update(
        { id: purchaseOrderId },
        { status: StatusPurchaseOrder.SENT },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CHANGE_STATUS,
        updatedAt,
        `Orden de compra ${purchaseOrder.purchaseOrderNumber} cambia estado de ${StatusPurchaseOrder.ACCEPTED} a ${StatusPurchaseOrder.SENT}`,
        purchaseOrder,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} desmarcada como aceptada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async unMarkAsDeclined(
    purchaseOrderId: number,
    updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    userName: string,
  ) {
    const { updatedAt } = updatePurchaseOrderStatusDto;

    const purchaseOrder = await this.purchaseOrderRepository.findOneBy({
      id: purchaseOrderId,
    });
    if (!purchaseOrder) {
      throw new BadRequestException(
        `Orden de compra con ID: ${purchaseOrderId} no encontrada.`,
      );
    }

    const allowedStatusToUnMarkAsDeclined = [StatusPurchaseOrder.DECLINED];

    if (
      !allowedStatusToUnMarkAsDeclined.includes(
        purchaseOrder.status as StatusPurchaseOrder,
      )
    ) {
      throw new BadRequestException(
        `No se permite desmarcar como rechazada una orden de compra si no presenta estado: ${allowedStatusToUnMarkAsDeclined}`,
      );
    }

    await this.purchaseOrderRepository.update(
      { id: purchaseOrderId },
      { status: StatusPurchaseOrder.SENT },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.CHANGE_STATUS,
      updatedAt,
      `Orden de compra ${purchaseOrder.purchaseOrderNumber} cambia estado de ${StatusPurchaseOrder.DECLINED} a ${StatusPurchaseOrder.SENT}`,
      purchaseOrder,
    );
    await this.trackingService.create(itemTrackingDto);

    return {
      msg: `Orden de compra ${purchaseOrder.purchaseOrderNumber} desmarcada como rechazada correctamente.`,
    };
  }
  /* END UnMark purchase orders*/

  // ============ PRIVATES METHODS ===============
  private async createPurchaseOrderItems(
    items: PurchaseOrderItemDto[],
  ): Promise<[PurchaseOrderItem[], number]> {
    let totalAmount: number = 0;
    const purchaseOrderItems: PurchaseOrderItem[] = [];

    for (const purchaseOrderItem of items) {
      const {
        quantity,
        itemId,
        sellerUid = null,
        accountId,
      } = purchaseOrderItem;
      const roundedPrice = roundToTwoDecimals(purchaseOrderItem.price);
      const itemEntity = await this.itemRepository.findOne({
        where: { id: itemId },
        relations: { cabys: true },
      });

      if (!itemEntity) {
        throw new BadRequestException(`Item con ID: ${itemId} no encontrado.`);
      }

      if (!itemEntity!.cabys) {
        throw new BadRequestException(
          `Item ${itemEntity.name} no contiene cabys y es obligatorio cada item contenga su cabys.`,
        );
      }

      let sellerEntity: Auth | null = null;
      if (sellerUid) {
        sellerEntity = await this.authRepository.findOneBy({
          uid: sellerUid,
        });
      }
      if (sellerUid && !sellerEntity) {
        throw new BadRequestException(
          `Vendedor con ID: ${sellerUid} no encontrado.`,
        );
      }

      // verify exists Account
      const accountEntity = await this.accountRepository.findOneBy({
        id: accountId,
      });
      if (!accountEntity) {
        throw new BadRequestException(
          `Cuenta contable con ID: ${accountId} no encontrada.`,
        );
      }

      // README: IVA is being calculated by frontend select option tax rate
      const totalWithoutIVA =
        purchaseOrderItem.discount > 0
          ? +(
              roundedPrice -
              (purchaseOrderItem.discount * roundedPrice) / 100
            ) * quantity
          : +roundedPrice * quantity;

      const amountLine =
        totalWithoutIVA +
        (totalWithoutIVA * getTaxRateValue(purchaseOrderItem.taxRate!)) / 100;
      totalAmount += amountLine;

      const newPurchaseOrderItem = this.purchaseOrderItemRepository.create({
        item: itemEntity,
        seller: sellerEntity ?? null,
        amount: roundToTwoDecimals(amountLine),
        price: roundedPrice,
        discount: purchaseOrderItem.discount ?? 0,
        quantity: purchaseOrderItem.quantity,
        description: purchaseOrderItem.description,
        account: accountEntity,
        taxRate: purchaseOrderItem.taxRate,
      });

      purchaseOrderItems.push(newPurchaseOrderItem);
    }

    return [purchaseOrderItems, roundToTwoDecimals(totalAmount)];
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    detail: string,
    purchaseOrder: PurchaseOrder,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail,
      refEntity: NameEntities.PURCHASE_ORDER,
      refEntityId: purchaseOrder.id,
    };

    return newTracking;
  }

  private handleErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at PurchaseOrder-Service. Error: ${err}`,
    );
  }
}
