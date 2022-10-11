import { Controller, Get } from '@nestjs/common';
import { Ffmpeg, InjectFluentFfmpeg } from '@mrkwskiti/fluent-ffmpeg-nestjs';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppConstants } from 'src/app.constants';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
@Controller()
export class AppController {
  constructor(@InjectFluentFfmpeg() private readonly ffmpeg: Ffmpeg) {}

  @Get()
  async run(): Promise<any> {
    const basePath = path.resolve(process.cwd());
    const tempImagesPath = `${basePath}${AppConstants.IMAGES_PATH}`;

    try {
      return new Promise(async (resolve, reject) => {
        const fileName = `${uuidv4()}.mp4`;
        const tempFilePath = `${basePath}${AppConstants.VIDEO_PATH}${fileName}`;

        const command = this.ffmpeg();
        const pattern = `${tempImagesPath}image_%d.webp`;

        command
          .addInput(pattern)
          .format('mp4')
          .videoCodec('libx264')
          // .outputOptions
          //   '-c:v libx264',
          // '-crf 23',
          // '-profile:v baseline',
          // '-level 3.0',
          // '-pix_fmt yuv420p',
          // ()
          // .addOutputOptions('-vf scale=720:-1')
          // .addOutputOptions('-threads 12')
          // .addOutputOptions('-profile:v main')
          // .addOutputOption('-crf 28')
          // .outputOptions('-c:a aac', '-ac 2', '-b:a 128k')
          // .outputOptions('-movflags faststart')
          // .addOption('-vf scale=720:-1')
          // .addOption('-acodec copy')
          // .addOption('-threads 12')
          // .addOutputOptions('-b:a 32k')
          // .videoCodec('h264_videotoolbox')
          // .withVideoBitrate('192k')
          .outputOptions('-movflags +faststart')
          .outputOptions('-vf scale=640:-2,format=yuv420p')
          // .outputOption('-vf format=yuv420p')
          // .outputOption('-vf scale=720:-1')
          // .outputOption('-acodec copy')
          // .outputOption('-threads 12')
          .inputFPS(1);

        command
          .output(tempFilePath)
          .on('end', (stdout, stderr) => {
            console.log(
              '🚀 ~ file: app.controller.ts ~ line 43 ~ AppController ~ .on ~ stdout',
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
