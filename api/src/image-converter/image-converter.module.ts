import { Module } from '@nestjs/common';
import { ImageConverterService } from './image-converter.service';
import { ImageConverterController } from './image-converter.controller';

@Module({
  providers: [ImageConverterService],
  controllers: [ImageConverterController],
})
export class ImageConverterModule {}
