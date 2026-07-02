import { Injectable } from '@nestjs/common';
import { CreateEventDto, EventType } from './dto/create-event.dto';

export type UserEvent = CreateEventDto & { createdAt: string };

const MAX_EVENTS_PER_USER = 500;

@Injectable()
export class EventsService {
  private byUser = new Map<string, UserEvent[]>();

  record(dto: CreateEventDto): UserEvent {
    const event: UserEvent = { ...dto, createdAt: new Date().toISOString() };
    const list = this.byUser.get(dto.userId) ?? [];
    list.push(event);
    if (list.length > MAX_EVENTS_PER_USER) {
      list.splice(0, list.length - MAX_EVENTS_PER_USER);
    }
    this.byUser.set(dto.userId, list);
    return event;
  }

  getEvents(userId: string): UserEvent[] {
    return this.byUser.get(userId) ?? [];
  }

  getEventsByType(userId: string, type: EventType): UserEvent[] {
    return this.getEvents(userId).filter((e) => e.type === type);
  }
}
