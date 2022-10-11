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
import { ImageConverterService } from './image-converter.service';
import * as fs from 'fs';
import { HttpErrorCodes } from 'src/config/http-response.codes';

@Controller('imageConverter')
export class ImageConverterController {
  constructor(private readonly imageConverterService: ImageConverterService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'none')
  @Header('accept-ranges', 'bytes')
  async convertImages(
    @Response({ passthrough: true }) res,
    @UploadedFile()
    image: Express.Multer.File,
  ): Promise<StreamableFile> {
    try {
      return new StreamableFile(
        fs.createReadStream(
          await this.imageConverterService.convertImages(image.buffer),
        ),
      );
    } catch (error) {
      throw new HttpException(
        {
          message: error,
          code: HttpErrorCodes.IMAGE_CONVERTER.code,
        },
        500,
      );
    }
  }
}
