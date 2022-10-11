import { Module } from '@nestjs/common';
import { VideoCreatorService } from './video-creator.service';
import { VideoCreatorController } from './video-creator.controller';
import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';

@Module({
  imports: [FluentFfmpegModule.forRoot()],
  providers: [VideoCreatorService],
  controllers: [VideoCreatorController],
})
export class VideoCreatorModule {}
