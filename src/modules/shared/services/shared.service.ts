import { Injectable } from '@nestjs/common';

import { Tracking } from 'src/modules/tracking/entities/tracking.entity';
import { TrackingService } from 'src/modules/tracking/tracking.service';

import { CreateTrackingNoteDto } from '../dto/create-tracking-note.dto';
import { CreateTrackingDto } from 'src/modules/tracking/dto/create-tracking.dto';
import { ActionOverEntity } from 'src/enums';

// to all generic endpoints
@Injectable()
export class SharedService {
  constructor(private readonly trackingService: TrackingService) {}

  async createTrackingNote(
    createTrackingNoteDto: CreateTrackingNoteDto,
    userName: string,
  ): Promise<Tracking> {
    const { createdAt, refEntity, refEntityId, note } = createTrackingNoteDto;

    const newTrackingNote: CreateTrackingDto = {
      action: ActionOverEntity.NOTE,
      executedAt: createdAt,
      executedBy: userName,
      detail: note,
      refEntity,
      refEntityId,
    };

    return await this.trackingService.create(newTrackingNote);
  }
}
