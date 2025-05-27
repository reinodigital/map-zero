import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Item } from './entities/item.entity';
import { Account } from '../accounting/entities/account.entity';
import { CabysList } from '../cabys/entities/cabys-list.entity';

import { CabysService } from '../cabys/cabys.service';
import { TrackingService } from '../tracking/tracking.service';
import { truncateSomeString } from '../shared/helpers/truncate-string.helper';

import {
  Constants,
  ICountAndItemAll,
  IDetailItem,
  IItemForSelect,
  IItemSuggestion,
  IMessage,
} from 'src/interfaces';
import { ActionOverEntity, NameEntities } from 'src/enums';
import { CreateItemDto, UpdateItemDto } from './dto/create-item.dto';
import { FindAllItemsDto } from './dto/find-all-items.dto';
import { CreateTrackingDto } from '../tracking/dto/create-tracking.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    private cabysService: CabysService,
    private trackingService: TrackingService,
  ) {}

  async create(
    createItemDto: CreateItemDto,
    userName: string,
  ): Promise<IMessage> {
    const {
      name,
      createdAt,
      cabys,
      saleAccountId = null,
      purchaseAccountId = null,
      ...restItem
    } = createItemDto;
    try {
      // verify name or unique code
      const item = await this.itemRepository.findOneBy({ name });
      if (item) {
        throw new BadRequestException(
          `Item con nombre o código único: ${name} ya existe en sistema.`,
        );
      }

      // verify and get cabys
      const cabysEntity = await this.getCabysEntity(cabys);

      // validate and get accounts
      const { purchaseAccount, saleAccount } =
        await this.validateAndGetAccounts(saleAccountId, purchaseAccountId);

      // create and save new item
      const newItem = this.itemRepository.create({
        name,
        createdAt,
        cabys: cabysEntity,
        ...restItem,
      });

      if (purchaseAccount) {
        newItem.purchaseAccount = purchaseAccount;
      }

      if (saleAccount) {
        newItem.saleAccount = saleAccount;
      }

      const savedItem = await this.itemRepository.save(newItem);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.CREATED,
        createdAt,
        savedItem,
      );
      await this.trackingService.create(itemTrackingDto);

      return { msg: 'Item agregado correctamente.' };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async fetchAllForSelect(): Promise<IItemForSelect[]> {
    try {
      const itemsForSelect = await this.itemRepository.find({
        order: { name: 'DESC' },
        select: [
          'id',
          'name',
          'cabys',
          'salePrice',
          'saleDescription',
          'saleAccount',
          'saleTaxRate',
        ],
        relations: { cabys: true, saleAccount: true },
      });

      return itemsForSelect;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // for custom-select items component as frontend
  async getSuggestions(terminus: string): Promise<IItemSuggestion[]> {
    try {
      const findOptions: FindManyOptions<Item> = {
        where: [
          { name: Like(`%${terminus}%`) },
          { cabys: { code: Like(`%${terminus}%`) } },
          { saleDescription: Like(`%${terminus}%`) },
        ],
        relations: { cabys: true, saleAccount: true },
        take: 12,
        order: {
          name: 'desc',
        },
      };

      const items = await this.itemRepository.find(findOptions);

      if (!items.length) {
        return [
          {
            id: null,
            name: Constants.NOT_RESULTS,
            shortName: Constants.NOT_RESULTS,
            cabys: Constants.NOT_RESULTS,
            description: Constants.NOT_RESULTS,
            salePrice: 0,
            saleAccountId: null,
          },
        ];
      }

      return items.map(
        (item) =>
          ({
            id: item.id,
            name: item.name,
            shortName: truncateSomeString(item.name),
            cabys: item.cabys.code,
            description: item.saleDescription,
            salePrice: item.salePrice,
            saleAccountId: item.saleAccount?.id ?? null,
          }) as IItemSuggestion,
      );
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findOneAsSuggestion(id: number): Promise<IItemSuggestion> {
    try {
      const item = await this.itemRepository.findOne({
        where: { id },
        relations: { cabys: true, saleAccount: true },
      });

      if (!item) {
        throw new BadRequestException(`Item con ID: ${id} no encontrado.`);
      }

      return {
        id: item.id,
        name: item.name,
        shortName: truncateSomeString(item.name),
        cabys: item.cabys.code,
        description: item.saleDescription ?? '',
        salePrice: item.salePrice ?? 0,
        saleAccountId: item.saleAccount?.id ?? null,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findAll(findAllItemsDto: FindAllItemsDto): Promise<ICountAndItemAll> {
    const { limit = 10, offset = 0, name = null } = findAllItemsDto;

    const findOptions: FindManyOptions<Item> = {
      take: limit,
      skip: offset,
      order: {
        createdAt: 'desc',
      },
    };

    const whereConditions: any = {};
    if (name) {
      whereConditions.name = Like(`%${name}%`);
    }

    if (Object.keys(whereConditions).length) {
      findOptions.where = whereConditions;
    }

    try {
      const [items, total] =
        await this.itemRepository.findAndCount(findOptions);

      return {
        count: total,
        items,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async findOne(id: number): Promise<IDetailItem> {
    try {
      const item = await this.itemRepository.findOne({
        where: { id },
        relations: { cabys: true, saleAccount: true, purchaseAccount: true },
      });

      if (!item) {
        throw new BadRequestException(`Item con ID: ${id} no encontrado.`);
      }

      // fetch trackings
      const result: IDetailItem = {
        ...item,
        tracking: await this.trackingService.fetchTrackings(
          NameEntities.ITEM,
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
    updateItemDto: UpdateItemDto,
    userName: string,
  ): Promise<IMessage> {
    const {
      name,
      cabys,
      updatedAt,
      purchaseAccountId,
      saleAccountId,
      ...restItem
    } = updateItemDto;
    try {
      const item = await this.findOne(id);

      // verify name or unique code
      const itemByName = await this.itemRepository.findOneBy({ name });
      if (itemByName && itemByName.id !== id) {
        throw new BadRequestException(
          `Item con nombre o código único: ${name} ya existe en sistema.`,
        );
      }

      // verify cabys
      let cabysEntity = item.cabys;
      if (cabys && cabys !== item.cabys.code) {
        cabysEntity = await this.getCabysEntity(cabys);
      }

      // update item
      const preloadedItem = await this.itemRepository.preload({
        id,
        name,
        cabys: cabysEntity,
        ...restItem,
      });

      // validate and get accounts
      if (saleAccountId || purchaseAccountId) {
        const { purchaseAccount, saleAccount } =
          await this.validateAndGetAccounts(
            saleAccountId ?? item.saleAccount?.id ?? null,
            purchaseAccountId ?? item.purchaseAccount?.id ?? null,
          );

        if (saleAccount) {
          preloadedItem!.saleAccount = saleAccount;
        }
        if (purchaseAccount) {
          preloadedItem!.purchaseAccount = purchaseAccount;
        }
      }

      const updatedItem = await this.itemRepository.save(preloadedItem!);

      // generate tracking
      const itemTrackingDto = this.generateTracking(
        userName,
        ActionOverEntity.EDITED,
        updatedAt,
        updatedItem,
      );
      await this.trackingService.create(itemTrackingDto);

      return {
        msg: `Item con nombre codigo: ${name} actualizado correctamente.`,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} item`;
  // }

  // ========= Helpers ===========
  private async validateAndGetAccounts(
    saleAccountId: number | null,
    purchaseAccountId: number | null,
  ): Promise<{ purchaseAccount: Account | null; saleAccount: Account | null }> {
    try {
      // verify purchase account if come
      let purchaseAccount: Account | null = null;
      if (purchaseAccountId) {
        purchaseAccount = await this.accountRepository.findOneBy({
          id: purchaseAccountId,
        });
        if (!purchaseAccount) {
          throw new NotFoundException(
            `Cuenta de compra con ID: ${purchaseAccountId} no encontrada.`,
          );
        }
      }

      // verify sale account
      let saleAccount: Account | null = null;
      if (saleAccountId) {
        saleAccount = await this.accountRepository.findOneBy({
          id: saleAccountId,
        });
        if (!saleAccount) {
          throw new NotFoundException(
            `Cuenta de venta con ID: ${saleAccountId} no encontrada.`,
          );
        }
      }

      return {
        purchaseAccount,
        saleAccount,
      };
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private async getCabysEntity(cabys: string): Promise<CabysList> {
    try {
      return await this.cabysService.findOneCabys(cabys);
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private generateTracking(
    userName: string,
    action: ActionOverEntity,
    date: string,
    item: Item,
  ): CreateTrackingDto {
    const newItemHistory: CreateTrackingDto = {
      action,
      executedAt: date,
      executedBy: userName,
      detail: `Item ${item.name} ${action}`,
      refEntity: NameEntities.ITEM,
      refEntityId: item.id,
    };

    return newItemHistory;
  }

  private handleErrorOnDB(err: any): never {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;
    if (errno === 1062 || errno === 1364)
      throw new BadRequestException(sqlMessage);

    throw new InternalServerErrorException(
      `Error not handled yet at ItemService. Error: ${err}`,
    );
  }
}
