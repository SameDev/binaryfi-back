import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';

@Module({
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
