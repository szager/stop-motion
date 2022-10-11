import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AudioConverterModule } from './audio-converter/audio-converter.module';
import { VideoCreatorModule } from './video-creator/video-creator.module';
import { CronService } from './cron/cron.service';
import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { ImageConverterModule } from './image-converter/image-converter.module';
import { VideoConverterService } from './video-converter/video-converter.service';
import { VideoConverterController } from './video-converter/video-converter.controller';
import { VideoConverterModule } from './video-converter/video-converter.module';

@Module({
  imports: [
    FluentFfmpegModule.forRoot(),
    ScheduleModule.forRoot(),
    AudioConverterModule,
    VideoCreatorModule,
    ImageConverterModule,
    VideoConverterModule,
  ],
  controllers: [AppController, VideoConverterController],
  providers: [CronService, VideoConverterService],
})
export class AppModule {}
