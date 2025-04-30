import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { AuthDecorator, GetUser } from '../auth/decorators';

import { ItemService } from './item.service';

import { CreateItemDto, UpdateItemDto } from './dto/create-item.dto';
import { FindAllItemsDto } from './dto/find-all-items.dto';
import { ListDataUser } from 'src/enums';

@AuthDecorator()
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(
    @GetUser(ListDataUser.name) userName: string, // decorator
    @Body() createItemDto: CreateItemDto,
  ) {
    return this.itemService.create(createItemDto, userName);
  }

  @Get()
  findAll(@Query() findAllItemsDto: FindAllItemsDto) {
    return this.itemService.findAll(findAllItemsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @GetUser(ListDataUser.name) userName: string, // decorator
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(+id, updateItemDto, userName);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.itemService.remove(+id);
  // }
}
