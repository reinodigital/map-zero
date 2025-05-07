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
import { formatDateAsReadable } from '../shared/helpers/format-date-as-readable.helper';

import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';
import { FindAllQuotesDto } from './dto/find-all-quotes.dto';
import {
  CreateQuoteDto,
  QuoteItemDto,
  UpdateQuoteDto,
} from './dto/create-quote.dto';
import { ActionOverEntity, NameEntities } from 'src/enums';
import { ICountAndQuoteAll, IMessage } from 'src/interfaces';

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
  ) {}

  async create(
    createQuoteDto: CreateQuoteDto,
    userName: string,
  ): Promise<IMessage> {
    const { createdAt, clientId, quoteItems, status, ...restQuote } =
      createQuoteDto;

    try {
      // verify exists Client
      const client = await this.clientRepository.findOneBy({ id: clientId });
      if (!client) {
        throw new BadRequestException(
          `Cliente con ID: ${clientId} no encontrado.`,
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
        `Cotización QU-${savedQuote.id} ${ActionOverEntity.CREATED} el ${formatDateAsReadable(createdAt)} por ${userName}`,
        savedQuote,
      );
      await this.trackingService.create(itemTrackingDto);

      // TODO: 1-verify if status come as sent we need to send email with quote PDF file attached

      return { msg: `Cotización generada con estado ${status} correctamente.` };
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

  findOne(id: number) {
    return `This action returns a #${id} quote`;
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

      // TODO: decide if we will calculate total by cabys IVA or frontend select tax rate IVA
      const totalWithoutIVA =
        quoteItem.discount > 0
          ? +(quoteItem.price - quoteItem.discount) * quantity
          : +quoteItem.price * quantity;

      const amountLine =
        totalWithoutIVA + (totalWithoutIVA * itemEntity.cabys.tax) / 100;
      totalAmount += amountLine;

      const newQuoteItem = this.quoteItemRepository.create({
        amount: amountLine,
        item: itemEntity,
        price: quoteItem.price,
        discount: quoteItem.discount ?? 0,
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
