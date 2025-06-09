import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from '../accounting/entities/account.entity';
import { Item } from '../item/entities/item.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { roundToTwoDecimals } from '../shared/helpers/round-two-decimals.helper';
import { getTaxRateValue } from '../shared/helpers/tax-rate';

import { InvoiceItemDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceItemService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  public async syncInvoiceItems(
    invoice: Invoice,
    incomingItems: InvoiceItemDto[],
  ): Promise<number> {
    let totalAmount = 0;

    const existingItems = await this.invoiceItemRepository.find({
      where: { invoice: { id: invoice.id } },
      relations: { account: true, item: { cabys: true } },
    });

    const finalItems: InvoiceItem[] = [];

    for (const incomingItem of incomingItems) {
      const {
        id,
        itemId,
        quantity,
        price,
        discount = 0,
        description,
        taxRate,
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
          // existingItem.seller = sellerEntity ?? null;
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
        const newItem = this.invoiceItemRepository.create({
          invoice,
          item: itemEntity,
          account: accountEntity,
          // seller: sellerEntity ?? null,
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
    const toRemove = existingItems.filter((ei) => !incomingIds.includes(ei.id));

    if (toRemove.length > 0) {
      await this.invoiceItemRepository.remove(toRemove);
    }

    // Save all final items (TypeORM will insert or update)
    await this.invoiceItemRepository.save(finalItems);

    return roundToTwoDecimals(totalAmount);
  }

  public async createInvoiceItems(
    items: InvoiceItemDto[],
  ): Promise<[InvoiceItem[], number]> {
    let totalAmount: number = 0;
    const invoiceItems: InvoiceItem[] = [];

    for (const invoiceItem of items) {
      const { quantity, itemId, accountId } = invoiceItem;
      const roundedPrice = roundToTwoDecimals(invoiceItem.price);
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
        invoiceItem.discount > 0
          ? +(roundedPrice - (invoiceItem.discount * roundedPrice) / 100) *
            quantity
          : +roundedPrice * quantity;

      const amountLine =
        totalWithoutIVA +
        (totalWithoutIVA * getTaxRateValue(invoiceItem.taxRate!)) / 100;
      totalAmount += amountLine;

      const newInvoiceItem = this.invoiceItemRepository.create({
        item: itemEntity,
        amount: roundToTwoDecimals(amountLine),
        price: roundedPrice,
        discount: invoiceItem.discount ?? 0,
        quantity: invoiceItem.quantity,
        description: invoiceItem.description,
        account: accountEntity,
        taxRate: invoiceItem.taxRate,
      });

      invoiceItems.push(newInvoiceItem);
    }

    return [invoiceItems, roundToTwoDecimals(totalAmount)];
  }
}
