import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
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

  // by the moment used at quote form at frontend
  @Get('all-select')
  findAllForSelect() {
    return this.itemService.fetchAllForSelect();
  }

  @Get('suggestions')
  getSuggestions(@Query('terminus') terminus: string) {
    return this.itemService.getSuggestions(terminus);
  }

  @Get('/find-one-as-suggestion/:id') // for edit quote form at frontend
  findOneAsSuggestion(@Param('id', ParseIntPipe) id: string) {
    return this.itemService.findOneAsSuggestion(+id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.itemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @GetUser(ListDataUser.name) userName: string, // decorator
    @Param('id', ParseIntPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(+id, updateItemDto, userName);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.itemService.remove(+id);
  // }
}
