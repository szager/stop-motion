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
import * as fs from 'fs';

import { VideoConverterService } from './video-converter.service';

@Controller('videoConverter')
export class VideoConverterController {
  constructor(private readonly videoConverterService: VideoConverterService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  @Header('Content-Type', 'video/mpeg')
  @Header('Cache-Control', 'none')
  @Header('accept-ranges', 'bytes')
  async convertVideo(
    @Response({ passthrough: true }) res,
    @UploadedFiles()
    files: {
      images: Express.Multer.File[];
      frameRate: Express.Multer.File[];
    },
    @Body() payload: { frameRate: number },
  ): Promise<StreamableFile> {
    const video = await this.videoConverterService.convertVideo(
      files.images,
      payload.frameRate,
    );

    return new StreamableFile(fs.createReadStream(video));
  }
}
