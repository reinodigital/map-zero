import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from '../auth/entities/auth.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Item } from '../item/entities/item.entity';
import { Account } from '../accounting/entities/account.entity';

import { roundToTwoDecimals } from '../shared/helpers/round-two-decimals.helper';
import { getTaxRateValue } from '../shared/helpers/tax-rate';

import { PurchaseOrderItemDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrderItemService {
  constructor(
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  public async syncPurchaseOrderItems(
    purchaseOrder: PurchaseOrder,
    incomingItems: PurchaseOrderItemDto[],
  ): Promise<number> {
    let totalAmount = 0;

    const existingItems = await this.purchaseOrderItemRepository.find({
      where: { purchaseOrder: { id: purchaseOrder.id } },
      relations: { seller: true, account: true, item: { cabys: true } },
    });

    const finalItems: PurchaseOrderItem[] = [];

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
        const newItem = this.purchaseOrderItemRepository.create({
          purchaseOrder: purchaseOrder,
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
    const toRemove = existingItems.filter((ei) => !incomingIds.includes(ei.id));

    if (toRemove.length > 0) {
      await this.purchaseOrderItemRepository.remove(toRemove);
    }

    // Save all final items (TypeORM will insert or update)
    await this.purchaseOrderItemRepository.save(finalItems);

    return roundToTwoDecimals(totalAmount);
  }
}
