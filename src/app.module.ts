import { Module } from '@nestjs/common';
import { SongsModule } from './songs/songs.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [SongsModule, SearchModule],
})
export class AppModule {}
