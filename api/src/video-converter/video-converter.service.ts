import { Ffmpeg, InjectFluentFfmpeg } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppConstants } from 'src/app.constants';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class VideoConverterService {
  private readonly logger = new Logger(VideoConverterService.name);

  constructor(@InjectFluentFfmpeg() private readonly ffmpeg: Ffmpeg) {}

  async convertVideo(
    images: Express.Multer.File[],
    frameRate: number,
  ): Promise<any> {
    const basePath = path.resolve(process.cwd());
    const tempImagesPath = `${basePath}${AppConstants.IMAGES_PATH}${uuidv4()}/`;

    fs.mkdirSync(tempImagesPath, { recursive: true });
    let fileExtension = 'png';

    if (images.length) {
      fileExtension = images[0].originalname.split('.').pop();
      images.forEach((image, index) => {
        this.logger.debug(`store image: ${image} with index ${index}`);
        fs.writeFileSync(
          `${tempImagesPath}image_${index}.${image.originalname}`,
          image.buffer,
        );
      });
    }

    try {
      return new Promise(async (resolve, reject) => {
        const fileName = `${uuidv4()}.webm`;
        const tempFilePath = `${basePath}${AppConstants.VIDEO_PATH}${fileName}`;

        const command = this.ffmpeg();
        const pattern = `${tempImagesPath}image_%d.${fileExtension}`;

        command
          .addInput(pattern)
          .format('webm')
          .videoCodec('libvpx')
          .inputFPS(frameRate);

        command
          .output(tempFilePath)
          .on('end', (stdout, stderr) => {
            console.log(
              '🚀 ~ file: video-creator.service.ts ~ line 59 ~ VideoCreatorService ~ .on ~ stdout',
              stdout,
            );
            console.log(
              '🚀 ~ file: video-creator.service.ts ~ line 55 ~ VideoCreatorService ~ .on ~ stderr',
              stderr,
            );
            resolve(tempFilePath);
          })
          .on('error', (err) => {
            console.log('an error happened: ' + err);
            reject(err);
          })
          .run();
      });
    } catch (error: any) {
      console.log('🚀 ~ file: app.service.ts ~ line 10 ~ error', error);
      return new Error(error);
    }
  }
}
