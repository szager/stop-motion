import { Injectable, Logger } from '@nestjs/common';
import * as webp from 'webp-converter';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppConstants } from 'src/app.constants';

@Injectable()
export class ImageConverterService {
  private readonly logger = new Logger(ImageConverterService.name);
  async convertImages(buffer: Buffer): Promise<any> {
    webp.grant_permission();
    const basePath = path.resolve(process.cwd());
    const tempImagesPath = `${basePath}${AppConstants.IMAGES_PATH}${uuidv4()}/`;

    fs.mkdirSync(tempImagesPath, { recursive: true });
    const fileExtension = 'png';
    fs.writeFileSync(`${tempImagesPath}image.${fileExtension}`, buffer);

    try {
      const file = await new Promise(async (resolve, reject) => {
        const pngFilePath = `${tempImagesPath}image.${fileExtension}`;
        const webpFilePath = `${tempImagesPath}image.webp`;
        await webp.cwebp(pngFilePath, webpFilePath, '-q 80');
        resolve(webpFilePath);
      });
      return file;
    } catch (error: any) {
      console.log('🚀 ~ file: app.service.ts ~ line 10 ~ error', error);
      return new Error(error);
    }
  }
}
