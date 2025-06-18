import { Controller, Get, Param, Query } from '@nestjs/common';

import { ActivityService } from './activity.service';

import { SimplePaginationDto } from '../shared/dto/simple_pagination.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // Activities SUGGESTIONS
  @Get('/search-activity/:term')
  suggestions(
    @Param('term') term: string,
    @Query() simplePaginationDto: SimplePaginationDto,
  ) {
    return this.activityService.getActivitiesSuggestions(
      term,
      simplePaginationDto,
    );
  }
}
