import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar interação do usuário',
    description:
      'Registra busca, play, favorito, skip ou unfavorite para alimentar as recomendações.',
  })
  record(@Body() dto: CreateEventDto) {
    const event = this.events.record(dto);
    return { ok: true, event };
  }

  @Get()
  @ApiOperation({
    summary: 'Histórico de interações',
    description:
      'Retorna os eventos registrados de um usuário (debug/inspeção).',
  })
  list(@Query('userId') userId: string) {
    return { userId, events: this.events.getEvents(userId ?? '') };
  }
}
