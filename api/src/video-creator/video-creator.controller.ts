import {
  Body,
  Controller,
  Header,
  Post,
  Response,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoCreatorService } from './video-creator.service';
import * as fs from 'fs';

@Controller('videoCreator')
export class VideoCreatorController {
  constructor(private readonly videoCreatorService: VideoCreatorService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }, { name: 'audio', maxCount: 1 }]),
  )
  @Header('Content-Type', 'video/mpeg')
  @Header('Cache-Control', 'none')
  @Header('accept-ranges', 'bytes')
  async convertVideo(
    @Response({ passthrough: true }) res,
    @UploadedFiles()
    files: {
      images: Express.Multer.File[];
      frameRate: Express.Multer.File[];
      audio: Express.Multer.File[];
    },
    @Body() payload: { frameRate: number },
  ): Promise<StreamableFile> {
    const video = await this.videoCreatorService.createVideo(
      files.images,
      payload.frameRate,
      files.audio,
    );

    return new StreamableFile(fs.createReadStream(video));
  }
}
