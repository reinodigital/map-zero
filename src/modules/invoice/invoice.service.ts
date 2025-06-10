import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Auth } from '../auth/entities/auth.entity';
import { Account } from '../accounting/entities/account.entity';
import { Client } from '../client/entities/client.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Item } from '../item/entities/item.entity';

import { InvoiceItemService } from './invoice-item.service';
import { TrackingService } from '../tracking/tracking.service';
import { ReportService } from '../shared/services/report.service';
import { NodemailerService } from '../shared/services/nodemailer.service';
import { roundToTwoDecimals } from '../shared/helpers/round-two-decimals.helper';

import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { ActionOverEntity, NameEntities, StatusInvoice } from 'src/enums';
import { ICountAndInvoiceAll, IDetailInvoice } from 'src/interfaces';
import { FindAllInvoicesDto } from './dto/find-all-invoices.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    private readonly invoiceItemService: InvoiceItemService,
    private readonly trackingService: TrackingService,
    private readonly reportService: ReportService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    userName: string,
  ): Promise<Invoice> {
    const {
      createdAt,
      client: clientDto,
      invoiceItems,
      status,
      action,
      ...restInvoice
    } = createInvoiceDto;

    // verify exists Client
    const client = await this.clientRepository.findOneBy({
      id: clientDto.id,
    });
    if (!client) {
      throw new BadRequestException(
        `Cliente con ID: ${clientDto.id} no encontrado.`,
      );
    }

    // create invoice-items and amount
    const [invoiceItemsEntities, totalToPay] =
      await this.invoiceItemService.createInvoiceItems(invoiceItems);

    // create invoice
    const newInvoice = this.invoiceRepository.create({
      client,
      invoiceItems: invoiceItemsEntities,
      status,
      total: roundToTwoDecimals(totalToPay),
      ...restInvoice,
    });

    const savedInvoice = await this.invoiceRepository.save(newInvoice);

    await this.invoiceRepository.update(
      { id: savedInvoice.id },
      { invoiceNumber: `FA-${savedInvoice.id}` },
    );

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.CREATED,
      createdAt,
      `Factura FA-${savedInvoice.id} creada con estado ${status}`,
      savedInvoice,
    );
    await this.trackingService.create(itemTrackingDto);

    return savedInvoice;
  }

  async findAll(
    findAllInvoicesDto: FindAllInvoicesDto,
  ): Promise<ICountAndInvoiceAll> {
    const {
      limit = 10,
      offset = 0,
      status = null,
      invoiceNumber = null,
    } = findAllInvoicesDto;

    const findOptions: FindManyOptions<Invoice> = {
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
    if (invoiceNumber) {
      whereConditions.invoiceNumber = Like(`%${invoiceNumber}%`);
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
    }

    const [invoices, totalQuery] =
      await this.invoiceRepository.findAndCount(findOptions);

    const { statusCounts, total } = await this.filterTotalsByInvoiceStatus();

    return {
      count: totalQuery,
      invoices,
      statusCounts,
      total,
    };
  }

  async findOne(id: number): Promise<IDetailInvoice> {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.invoiceItems', 'invoiceItems')
      .leftJoin('invoiceItems.item', 'item') // You can also use leftJoinAndSelect if needed
      // .leftJoin('invoiceItems.seller', 'seller')
      .leftJoin('invoiceItems.account', 'account')
      .addSelect(['item.name', 'item.id']) // Only select item.name and item.id
      // .addSelect(['seller.name', 'seller.uid']) // Only select seller.name and seller.uid
      .addSelect(['account.name', 'account.id', 'account.code'])
      .where('invoice.id = :id', { id })
      .getOne();

    if (!invoice) {
      throw new BadRequestException(`Factura con ID: ${id} no encontrada.`);
    }

    // fetch trackings
    const result: IDetailInvoice = {
      ...invoice,
      tracking: await this.trackingService.fetchTrackings(
        NameEntities.INVOICE,
        id,
      ),
    };

    return result;
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
    userName: string,
  ): Promise<Invoice> {
    const {
      invoiceItems = [],
      client,
      updatedAt,
      ...restInvoice
    } = updateInvoiceDto;

    const existingInvoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { client: true, invoiceItems: true },
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    const allowedStatusToEditInvoice = [StatusInvoice.DRAFT];
    if (
      !allowedStatusToEditInvoice.includes(
        existingInvoice.status as StatusInvoice,
      )
    ) {
      throw new BadRequestException(
        `Factura ${existingInvoice.invoiceNumber} con estado ${existingInvoice.status} no permite ser editada. Para editar una factura debe de presentar uno de los estados siguientes: [${allowedStatusToEditInvoice}]`,
      );
    }

    // STEP 1: verify if client changed
    let possibleNewClient: Client = existingInvoice.client;
    if (client?.id && existingInvoice.client.id !== client.id) {
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

    // STEP 2: preload invoice with new data
    const preloadedInvoice: Invoice | undefined =
      await this.invoiceRepository.preload({
        id,
        ...restInvoice,
        client: possibleNewClient,
      });

    // STEP 3: synchronize invoice items
    const totalToPay = await this.invoiceItemService.syncInvoiceItems(
      preloadedInvoice!,
      invoiceItems,
    );

    preloadedInvoice!.total = roundToTwoDecimals(totalToPay);

    const savedInvoice = await this.invoiceRepository.save(preloadedInvoice!);

    // generate tracking
    const itemTrackingDto = this.generateTracking(
      userName,
      ActionOverEntity.EDITED,
      updatedAt,
      `Factura FA-${savedInvoice.id} ha sido editada`,
      savedInvoice,
    );
    await this.trackingService.create(itemTrackingDto);

    return savedInvoice;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
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

  private async filterTotalsByInvoiceStatus(): Promise<any> {
    const groupedStatusRaw = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('invoice.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('invoice.status')
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
  }
}
