import { Injectable } from '@nestjs/common';
import { InjectFluentFfmpeg, Ffmpeg } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { Readable } from 'stream';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppConstants } from 'src/app.constants';

@Injectable()
export class AudioConverterService {
  constructor(@InjectFluentFfmpeg() private readonly ffmpeg: Ffmpeg) {}

  async convertAudio(buffer: Buffer): Promise<any> {
    try {
      return new Promise(async (resolve, reject) => {
        const tempFilePath = `${path.resolve(process.cwd())}${
          AppConstants.AUDIO_PATH
        }${uuidv4()}.mp3`;

        this.ffmpeg(Readable.from(buffer))
          .noVideo()
          .format('mp3')
          .on('end', (stdout, stderr) => {
            console.log(
              '🚀 ~ file: audio-converter.service.ts ~ line 42 ~ AudioConverterService ~ .on ~ stderr',
              stderr,
            );
            console.log(
              '🚀 ~ file: audio-converter.service.ts ~ line 16 ~ AudioConverterService ~ .on ~ stderr',
              stderr,
            );
            resolve(tempFilePath);
          })
          .on('error', (err) => {
            console.log('an error happened: ' + err.message);
            reject(err.message);
          })
          .output(tempFilePath)
          .run();
      });
    } catch (error: any) {
      console.log('🚀 ~ file: app.service.ts ~ line 10 ~ error', error);
      return new Error(error);
    }
  }
}
