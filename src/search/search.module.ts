import { Module } from '@nestjs/common';
import { SongsModule } from '../songs/songs.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [SongsModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
