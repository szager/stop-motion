import {
  Controller,
  Header,
  HttpException,
  Post,
  Response,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { HttpErrorCodes } from 'src/config/http-response.codes';
import { AudioConverterService } from './audio-converter.service';

@Controller('audioConverter')
export class AudioConverterController {
  constructor(private readonly audioConverterService: AudioConverterService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'none')
  @Header('accept-ranges', 'bytes')
  async convertAudio(
    @Response({ passthrough: true }) res,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StreamableFile> {
    try {
      return new StreamableFile(
        fs.createReadStream(
          await this.audioConverterService.convertAudio(file.buffer),
        ),
      );
    } catch (error) {
      throw new HttpException(
        {
          message: error,
          code: HttpErrorCodes.AUDIO_CONVERTER.code,
        },
        500,
      );
    }
  }
}
