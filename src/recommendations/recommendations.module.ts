import { Module } from '@nestjs/common';
import { SongsModule } from '../songs/songs.module';
import { EventsModule } from '../events/events.module';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [SongsModule, EventsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
