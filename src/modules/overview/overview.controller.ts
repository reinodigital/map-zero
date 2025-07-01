import { Controller, Get } from '@nestjs/common';

import { OverviewService } from './overview.service';
import { AuthDecorator } from '../auth/decorators';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('sales')
  @AuthDecorator()
  fetchSalesOverview() {
    return this.overviewService.getSalesOverview();
  }

  @Get('purchases')
  @AuthDecorator()
  fetchPurchasesOverview() {
    return this.overviewService.getPurchasesOverview();
  }
}
