import { Module } from '@nestjs/common';
import { SongsModule } from '../songs/songs.module';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [SongsModule],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
