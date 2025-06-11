import { Body, Controller, Post } from '@nestjs/common';

import { AuthDecorator, GetUser } from '../auth/decorators';
import { SharedService } from './services/shared.service';

import { ListDataUser } from 'src/enums';
import { CreateTrackingNoteDto } from './dto/create-tracking-note.dto';

@Controller('shared')
export class SharedController {
  constructor(private readonly sharedService: SharedService) {}

  @Post('add-tracking-note')
  @AuthDecorator()
  create(
    @Body() createTrackingNoteDto: CreateTrackingNoteDto,
    @GetUser(ListDataUser.name) userName: string, // decorator
  ) {
    return this.sharedService.createTrackingNote(
      createTrackingNoteDto,
      userName,
    );
  }
}
