import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Item } from './entities/item.entity';
import { ItemHistory } from './entities/item_history.entity';
import { CabysList } from '../cabys/entities/cabys-list.entity';

import { CabysService } from '../cabys/cabys.service';

import { ICountAndItemAll, IMessage } from 'src/interfaces';
import { ActionOverEntity } from 'src/enums';
import { CreateItemDto, UpdateItemDto } from './dto/create-item.dto';
import { FindAllItemsDto } from './dto/find-all-items.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemHistory)
    private readonly itemHistoryRepository: Repository<ItemHistory>,

    private cabysService: CabysService,
  ) {}

  async create(
    createItemDto: CreateItemDto,
    userName: string,
  ): Promise<IMessage> {
    const { name, createdAt, cabys, ...restItem } = createItemDto;
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

      // generate item - history
      const itemHistoryByCreation = this.generateItemHistory(
        userName,
        ActionOverEntity.CREATED,
        createdAt,
      );

      // create and save new item
      const newItem = this.itemRepository.create({
        name,
        createdAt,
        cabys: cabysEntity,
        itemHistory: [itemHistoryByCreation],
        ...restItem,
      });

      await this.itemRepository.save(newItem);

      return { msg: 'Item agregado correctamente.' };
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

  async findOne(id: number): Promise<Item> {
    try {
      const item = await this.itemRepository.findOne({
        where: { id },
        relations: { cabys: true, itemHistory: true },
      });

      if (!item) {
        throw new BadRequestException(`Item con ID: ${id} no encontrado.`);
      }

      return item;
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    userName: string,
  ): Promise<IMessage> {
    const { name, cabys, updatedAt, ...restItem } = updateItemDto;
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

      const updatedItem = await this.itemRepository.save(preloadedItem!);

      // generate item - history
      const itemHistoryByEdition = this.generateItemHistory(
        userName,
        ActionOverEntity.EDITED,
        updatedAt,
      );

      itemHistoryByEdition.item = updatedItem;

      await this.itemHistoryRepository.save(itemHistoryByEdition);

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
  private async getCabysEntity(cabys: string): Promise<CabysList> {
    try {
      return await this.cabysService.findOneCabys(cabys);
    } catch (error) {
      this.handleErrorOnDB(error);
    }
  }

  private generateItemHistory(
    userName: string,
    action: ActionOverEntity,
    date: string,
  ): ItemHistory {
    const newItemHistory = this.itemHistoryRepository.create({
      action,
      executedAt: date,
      executedBy: userName,
      description: `Item ${action} el ${date} por ${userName}`,
    });

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
