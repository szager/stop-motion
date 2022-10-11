import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { Module } from '@nestjs/common';
import { AudioConverterController } from './audio-converter.controller';
import { AudioConverterService } from './audio-converter.service';

@Module({
  imports: [FluentFfmpegModule.forRoot()],
  controllers: [AudioConverterController],
  providers: [AudioConverterService],
})
export class AudioConverterModule {}
