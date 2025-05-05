import { Controller, Get, Param, Query } from '@nestjs/common';

import { CabysService } from './cabys.service';
import { SimplePaginationDto } from '../shared/dto/simple_pagination.dto';

@Controller('cabys')
export class CabysController {
  constructor(private readonly cabysService: CabysService) {}

  // Cabys SUGGESTIONS
  @Get('/search-cabys/:term')
  suggestions(
    @Param('term') term: string,
    @Query() simplePaginationDto: SimplePaginationDto,
  ) {
    return this.cabysService.getCabysSuggestions(term, simplePaginationDto);
  }
}
