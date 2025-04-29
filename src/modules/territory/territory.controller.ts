import { Controller, Get, Query } from '@nestjs/common';
import { TerritoryService } from './territory.service';
import { AuthDecorator } from '../auth/decorators/auth.decorator';
import { GetCantonByProvinceDto } from './dto/getCantonByProvince.dto';
import { GetDistrictByCantonDto } from './dto/getDistrictByCanton.dto';

@Controller('territory')
export class TerritoryController {
  constructor(private readonly territoryService: TerritoryService) {}

  @Get('/provinces')
  @AuthDecorator()
  findProvinces() {
    return this.territoryService.findProvinces();
  }

  @Get('/cantons')
  @AuthDecorator()
  findCantonsByProvinceId(
    @Query() getCantonByProvinceDto: GetCantonByProvinceDto,
  ) {
    const { provinceId } = getCantonByProvinceDto;
    return this.territoryService.findCantonsByProvinceId(provinceId);
  }

  @Get('/districts')
  @AuthDecorator()
  findDistrictsByCantonId(
    @Query() getDistrictByCantonDto: GetDistrictByCantonDto,
  ) {
    const { cantonId } = getDistrictByCantonDto;
    return this.territoryService.findDistrictsByCantonId(cantonId);
  }
}
