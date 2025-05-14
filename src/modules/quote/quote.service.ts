import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Auth } from '../auth/entities/auth.entity';
import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { Client } from '../client/entities/client.entity';
import { Item } from '../item/entities/item.entity';
import { TrackingService } from '../tracking/tracking.service';
import { ReportService } from '../shared/services/report.service';
import { NodemailerService } from '../shared/services/nodemailer.service';

import { getTaxRateValue } from '../shared/helpers/tax-rate';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { FindAllQuotesDto } from './dto/find-all-quotes.dto';
import {
  CreateQuoteDto,
  EmailQuoteDto,
  QuoteItemDto,
  UpdateQuoteDto,
} from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { ActionOverEntity, NameEntities, StatusQuote } from 'src/enums';
import { ICountAndQuoteAll, IDetailQuote, IMessage } from 'src/interfaces';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,

    @InjectRepository(QuoteItem)
    private readonly quoteItemRepository: Repository<QuoteItem>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    private readonly trackingService: TrackingService,
    private readonly reportService: ReportService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async create(
    createQuoteDto: CreateQuoteDto,
    userName: string,
  ): Promise<Quote> {
    const {
      createdAt,
      client: clientDto,
      quoteItems,
      status,
      action,
      ...restQuote
    } = createQuoteDto.quote;

    try {
      // verify exists Client
      const client = await this.clientRepository.findOneBy({
        id: clientDto.id,
      });
      if (!client) {
        throw new BadRequestException(
          `Cliente con ID: ${clientDto.id} no encontrado.`,
        );
      }

      // create quote-items and amount
      const [quoteItemsEntities, totalToPay] =
        await this.createQuoteItems(quoteItems);

      // create quote
      const newQuote = this.quoteRepository.create({
        client,
        quoteItems: quoteItemsEntities,
        status,
        total: totalToPay,
        ...restQuote,
      });

      const savedQuote = await this.quoteRepository.save(newQuote);

      await this.quoteRepository.update(
        { id: savedQuote.id },
        { quoteNumber: `QU-${savedQuote.id}` },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CREATED,
        createdAt,
        `Cotización QU-${savedQuote.id} creada con estado ${status}`,
        savedQuote,
      );
      await this.trackingService.create(itemTrackingDto);

      return savedQuote;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  public async sendEmailQuote(
    quoteId: number,
    emailQuoteDto: EmailQuoteDto,
    userName: string,
  ): Promise<IMessage> {
    try {
      const quote = await this.quoteRepository.findOne({
        where: { id: quoteId },
        relations: {
          client: { addresses: true },
          quoteItems: { item: { cabys: true } },
        },
      });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      if (!emailQuoteDto.emails || !emailQuoteDto.emails.length) {
        throw new BadRequestException(
          'Se ocupa el menos una bandeja de correo para enviar la cotización.',
        );
      }

      await this.nodemailerService.sendQuoteEmail(quote, emailQuoteDto);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.SENT,
        emailQuoteDto.sentAt,
        `Cotización ${quote.quoteNumber} enviada por correo electrónico [${emailQuoteDto.emails.join(', ')}]`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      // verify if status quote is draft to update it to sent
      if (quote.status === StatusQuote.DRAFT) {
        await this.quoteRepository.update(
          { id: quote.id },
          { status: StatusQuote.SENT },
        );
      }

      return {
        msg: `Cotización enviada correctamente por correo electrónico.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  public async generatePDF(quoteId: number): Promise<PDFKit.PDFDocument> {
    try {
      const quote = await this.quoteRepository.findOne({
        where: { id: quoteId },
        relations: {
          client: { addresses: true },
          quoteItems: { item: { cabys: true } },
        },
      });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      const doc = await this.reportService.generateQuotePDF(quote);

      return doc;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findAll(
    findAllQuotesDto: FindAllQuotesDto,
  ): Promise<ICountAndQuoteAll> {
    const {
      limit = 10,
      offset = 0,
      status = null,
      quoteNumber = null,
    } = findAllQuotesDto;

    const findOptions: FindManyOptions<Quote> = {
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
    if (quoteNumber) {
      whereConditions.quoteNumber = Like(`%${quoteNumber}%`);
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
    }

    try {
      const [quotes, total] =
        await this.quoteRepository.findAndCount(findOptions);

      return {
        count: total,
        quotes,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findOne(id: number): Promise<IDetailQuote> {
    try {
      const quote = await this.quoteRepository
        .createQueryBuilder('quote')
        .leftJoinAndSelect('quote.client', 'client')
        .leftJoinAndSelect('quote.quoteItems', 'quoteItems')
        .leftJoin('quoteItems.item', 'item') // You can also use leftJoinAndSelect if needed
        .leftJoin('quoteItems.seller', 'seller')
        .addSelect(['item.name']) // Only select seller.name and seller.uid
        .addSelect(['seller.name', 'seller.uid']) // Only select seller.name and seller.uid
        .where('quote.id = :id', { id })
        .getOne();

      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${id} no encontrada.`,
        );
      }

      // fetch trackings
      const result: IDetailQuote = {
        ...quote,
        tracking: await this.trackingService.fetchTrackings(
          NameEntities.QUOTE,
          id,
        ),
      };

      return result;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  update(id: number, updateQuoteDto: UpdateQuoteDto) {
    return `This action updates a #${id} quote`;
  }

  async remove(
    id: number,
    removedAt: string,
    userName: string,
  ): Promise<IMessage> {
    try {
      const quote = await this.quoteRepository.findOneBy({ id });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${id} no encontrada.`,
        );
      }

      await this.quoteRepository.update(
        { id },
        { status: StatusQuote.REMOVED, isActive: false },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.REMOVED,
        removedAt,
        `Cotización ${quote.quoteNumber} removida`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return { msg: `Cotización ${quote.quoteNumber} removida correctamente.` };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // WORKFLOW STEP 1
  async markAsSent(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      if (quote.status === StatusQuote.SENT) {
        return {
          msg: `Cotización ${quote.quoteNumber} ya estaba con estado enviada anteriormente.`,
        };
      }

      const allowedStatusToMarkAsSent = [StatusQuote.DRAFT];

      if (!allowedStatusToMarkAsSent.includes(quote.status as StatusQuote)) {
        throw new BadRequestException(
          `No se permite marcar cotización como enviada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsSent.join(', ')}]`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.SENT },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.SENT,
        updatedAt,
        `Cotización ${quote.quoteNumber} marcada como enviada`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} marcada como enviada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // WORKFLOW STEP 2 - ACCEPTED
  async markAsAccepted(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateQuoteStatusDto;

    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      if (quote.status === StatusQuote.ACCEPTED) {
        return {
          msg: `Cotización ${quote.quoteNumber} ya estaba con estado aceptada anteriormente.`,
        };
      }

      const allowedStatusToMarkAsAccepted = [StatusQuote.SENT];

      if (
        !allowedStatusToMarkAsAccepted.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite marcar cotización como aceptada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsAccepted.join(', ')}]`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.ACCEPTED },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.ACCEPTED,
        updatedAt,
        `Cotización ${quote.quoteNumber} marcada como aceptada`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} marcada como aceptada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // WORKFLOW STEP 2 - DECLINED
  async markAsDeclined(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      if (quote.status === StatusQuote.DECLINED) {
        return {
          msg: `Cotización ${quote.quoteNumber} ya estaba con estado rechazada anteriormente.`,
        };
      }

      const allowedStatusToMarkAsDeclined = [StatusQuote.SENT];

      if (
        !allowedStatusToMarkAsDeclined.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite marcar cotización como rechazada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsDeclined.join(', ')}]`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.DECLINED },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.DECLINED,
        updatedAt,
        `Cotización ${quote.quoteNumber} marcada como rechazada`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} marcada como rechazada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // WORKFLOW STEP 3
  async markAsInvoiced(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ): Promise<IMessage> {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      if (quote.status === StatusQuote.INVOICED) {
        return {
          msg: `Cotización ${quote.quoteNumber} ya estaba con estado facturada anteriormente.`,
        };
      }

      const allowedStatusToMarkAsInvoiced = [StatusQuote.ACCEPTED];

      if (
        !allowedStatusToMarkAsInvoiced.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite marcar cotización como facturada si no presenta uno de los estados siguientes: [${allowedStatusToMarkAsInvoiced.join(', ')}]`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.INVOICED },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.INVOICED,
        updatedAt,
        `Cotización ${quote.quoteNumber} marcada como facturada`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} marcada como facturada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  /* UnMark quotes*/
  async unMarkAsAccepted(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ) {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      const allowedStatusToUnMarkAsAccepted = [StatusQuote.ACCEPTED];

      if (
        !allowedStatusToUnMarkAsAccepted.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite desmarcar como aceptada una cotización si no presenta estado: ${allowedStatusToUnMarkAsAccepted}`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.SENT },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CHANGE_STATUS,
        updatedAt,
        `Cotización ${quote.quoteNumber} cambia estado de ${StatusQuote.ACCEPTED} a ${StatusQuote.SENT}`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} desmarcada como aceptada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async unMarkAsDeclined(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ) {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      const allowedStatusToUnMarkAsDeclined = [StatusQuote.DECLINED];

      if (
        !allowedStatusToUnMarkAsDeclined.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite desmarcar como rechazada una cotización si no presenta estado: ${allowedStatusToUnMarkAsDeclined}`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.SENT },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CHANGE_STATUS,
        updatedAt,
        `Cotización ${quote.quoteNumber} cambia estado de ${StatusQuote.DECLINED} a ${StatusQuote.SENT}`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} desmarcada como rechazada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async unMarkAsInvoiced(
    quoteId: number,
    updateQuoteStatusDto: UpdateQuoteStatusDto,
    userName: string,
  ) {
    const { updatedAt } = updateQuoteStatusDto;
    try {
      const quote = await this.quoteRepository.findOneBy({ id: quoteId });
      if (!quote) {
        throw new BadRequestException(
          `Cotización con ID: ${quoteId} no encontrada.`,
        );
      }

      const allowedStatusToUnMarkAsInvoiced = [StatusQuote.INVOICED];

      if (
        !allowedStatusToUnMarkAsInvoiced.includes(quote.status as StatusQuote)
      ) {
        throw new BadRequestException(
          `No se permite desmarcar como facturada una cotización si no presenta estado: ${allowedStatusToUnMarkAsInvoiced}`,
        );
      }

      await this.quoteRepository.update(
        { id: quoteId },
        { status: StatusQuote.ACCEPTED },
      );

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CHANGE_STATUS,
        updatedAt,
        `Cotización ${quote.quoteNumber} cambia estado de ${StatusQuote.INVOICED} a ${StatusQuote.ACCEPTED}`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Cotización ${quote.quoteNumber} desmarcada como facturada correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }
  /* END UnMark quotes*/

  // ============ PRIVATES METHODS ===============
  private async createQuoteItems(
    items: QuoteItemDto[],
  ): Promise<[QuoteItem[], number]> {
    let totalAmount: number = 0;
    const quoteItems: QuoteItem[] = [];

    try {
      for (const quoteItem of items) {
        const { quantity, itemId, sellerUid = null } = quoteItem;
        const itemEntity = await this.itemRepository.findOne({
          where: { id: itemId },
          relations: { cabys: true },
        });

        if (!itemEntity) {
          throw new BadRequestException(
            `Item con ID: ${itemId} no encontrado.`,
          );
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

        // README: IVA is being calculated by frontend select option tax rate
        const totalWithoutIVA =
          quoteItem.discount > 0
            ? +(
                quoteItem.price -
                (quoteItem.discount * quoteItem.price) / 100
              ) * quantity
            : +quoteItem.price * quantity;

        const amountLine =
          totalWithoutIVA +
          (totalWithoutIVA * getTaxRateValue(quoteItem.taxRate!)) / 100;
        totalAmount += amountLine;

        const newQuoteItem = this.quoteItemRepository.create({
          item: itemEntity,
          seller: sellerEntity ?? null,
          amount: amountLine,
          price: quoteItem.price,
          discount: quoteItem.discount ?? 0,
          quantity: quoteItem.quantity,
          description: quoteItem.description,
          account: quoteItem.account,
          taxRate: quoteItem.taxRate,
        });

        quoteItems.push(newQuoteItem);
      }

      return [quoteItems, totalAmount];
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    detail: string,
    quote: Quote,
  ): CreateTrackingDto {
    const newTracking: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail,
      refEntity: NameEntities.QUOTE,
      refEntityId: quote.id,
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
      `Error not handled yet at Quote-Service. Error: ${err}`,
    );
  }
}
