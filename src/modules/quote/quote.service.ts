import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { Client } from '../client/entities/client.entity';
import { Item } from '../item/entities/item.entity';
import { TrackingService } from '../tracking/tracking.service';
import { ReportService } from '../shared/services/report.service';

import { getTaxRateValue } from '../shared/helpers/tax-rate';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { FindAllQuotesDto } from './dto/find-all-quotes.dto';
import {
  CreateQuoteDto,
  QuoteItemDto,
  UpdateQuoteDto,
} from './dto/create-quote.dto';
import { ActionOverEntity, NameEntities } from 'src/enums';
import { ICountAndQuoteAll, IDetailQuote, IMessage } from 'src/interfaces';
import { NewQuoteFormAction } from '../../enums/quote.enum';

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

    private readonly trackingService: TrackingService,
    private readonly reportService: ReportService,
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

    let emails: string[] = [];
    if (createQuoteDto.email) {
      emails = createQuoteDto.email.emails;
    }

    try {
      // email if action === send
      if (action === NewQuoteFormAction.SEND && !emails.length) {
        throw new BadRequestException(
          'Se ocupa al menos un correo de bandeja para enviar la Cotización.',
        );
      }

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

      if (action === NewQuoteFormAction.SEND) {
        // TODO: create PDF and send email with attached file
        //
      }

      return savedQuote;
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
      const quote = await this.quoteRepository.findOne({
        where: { id },
        relations: { client: true, quoteItems: { item: true } },
      });

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

    for (const quoteItem of items) {
      const { quantity, itemId } = quoteItem;
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

      // README: IVA is being calculated by frontend select option tax rate
      const totalWithoutIVA =
        quoteItem.discount > 0
          ? +(quoteItem.price - (quoteItem.discount * quoteItem.price) / 100) *
            quantity
          : +quoteItem.price * quantity;

      const amountLine =
        totalWithoutIVA +
        (totalWithoutIVA * getTaxRateValue(quoteItem.taxRate!)) / 100;
      totalAmount += amountLine;

      const newQuoteItem = this.quoteItemRepository.create({
        item: itemEntity,
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
