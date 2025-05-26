import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from '../auth/entities/auth.entity';
import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { Item } from '../item/entities/item.entity';
import { Account } from '../accounting/entities/account.entity';
import { roundToTwoDecimals } from '../shared/helpers/round-two-decimals.helper';
import { getTaxRateValue } from '../shared/helpers/tax-rate';

import { QuoteItemDto } from './dto/create-quote.dto';

@Injectable()
export class QuoteItemService {
  constructor(
    @InjectRepository(QuoteItem)
    private readonly quoteItemRepository: Repository<QuoteItem>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  public async syncQuoteItems(
    quote: Quote,
    incomingItems: QuoteItemDto[],
  ): Promise<number> {
    try {
      let totalAmount = 0;

      const existingItems = await this.quoteItemRepository.find({
        where: { quote: { id: quote.id } },
        relations: { seller: true, account: true, item: { cabys: true } },
      });

      const finalItems: QuoteItem[] = [];

      for (const incomingItem of incomingItems) {
        const {
          id,
          itemId,
          quantity,
          price,
          discount = 0,
          description,
          taxRate,
          sellerUid,
          accountId,
        } = incomingItem;

        const roundedPrice = roundToTwoDecimals(price);

        const itemEntity = await this.itemRepository.findOne({
          where: { id: itemId },
          relations: { cabys: true },
        });

        if (!itemEntity || !itemEntity.cabys) {
          throw new BadRequestException(
            `Item con ID ${itemId} inválido o sin CABYS.`,
          );
        }

        const accountEntity = await this.accountRepository.findOneBy({
          id: accountId,
        });

        if (!accountEntity) {
          throw new BadRequestException(
            `Cuenta contable con ID ${accountId} no encontrada.`,
          );
        }

        let sellerEntity: Auth | null = null;
        if (sellerUid) {
          sellerEntity = await this.authRepository.findOneBy({
            uid: sellerUid,
          });

          if (!sellerEntity) {
            throw new BadRequestException(
              `Vendedor con UID ${sellerUid} no encontrado.`,
            );
          }
        }

        const totalWithoutIVA =
          discount > 0
            ? (roundedPrice - (discount * roundedPrice) / 100) * quantity
            : roundedPrice * quantity;

        const amount =
          totalWithoutIVA + (totalWithoutIVA * getTaxRateValue(taxRate!)) / 100;

        totalAmount += amount;

        if (id) {
          // Update existing item
          const existingItem = existingItems.find((ei) => ei.id === id);
          if (existingItem) {
            existingItem.item = itemEntity;
            existingItem.account = accountEntity;
            existingItem.seller = sellerEntity ?? null;
            existingItem.quantity = quantity;
            existingItem.price = roundedPrice;
            existingItem.discount = discount;
            existingItem.description = description;
            existingItem.taxRate = taxRate;
            existingItem.amount = roundToTwoDecimals(amount);
            finalItems.push(existingItem);
          }
        } else {
          // Create new item
          const newItem = this.quoteItemRepository.create({
            quote,
            item: itemEntity,
            account: accountEntity,
            seller: sellerEntity ?? null,
            quantity,
            price: roundedPrice,
            discount,
            description,
            taxRate,
            amount: roundToTwoDecimals(amount),
          });
          finalItems.push(newItem);
        }
      }

      // Delete removed items
      const incomingIds = incomingItems.filter((i) => i.id).map((i) => i.id);
      const toRemove = existingItems.filter(
        (ei) => !incomingIds.includes(ei.id),
      );

      if (toRemove.length > 0) {
        await this.quoteItemRepository.remove(toRemove);
      }

      // Save all final items (TypeORM will insert or update)
      await this.quoteItemRepository.save(finalItems);

      return roundToTwoDecimals(totalAmount);
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private handleErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at Quote-Item Service. Error: ${err}`,
    );
  }
}
