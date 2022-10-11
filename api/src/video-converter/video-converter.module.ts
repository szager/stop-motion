import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { Module } from '@nestjs/common';
import { VideoConverterController } from './video-converter.controller';
import { VideoConverterService } from './video-converter.service';

@Module({
  imports: [FluentFfmpegModule.forRoot()],
  providers: [VideoConverterService],
  controllers: [VideoConverterController],
})
export class VideoConverterModule {}
