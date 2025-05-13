import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

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
import { ActionOverEntity, NameEntities } from 'src/enums';
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
        `Cotización ${quote.quoteNumber} enviada por correo electrónico`,
        quote,
      );
      await this.trackingService.create(itemTrackingDto);

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
    const { limit = 10, offset = 0, status = null } = findAllQuotesDto;

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

  remove(id: number) {
    return `This action removes a #${id} quote`;
  }

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
