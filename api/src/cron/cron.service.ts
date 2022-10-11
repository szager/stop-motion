import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as del from 'del';
import { AppConstants } from 'src/app.constants';
import * as path from 'path';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async run() {
    const basePath = path.resolve(process.cwd());
    await del([`${basePath}${AppConstants.AUDIO_PATH}**`]);
    await del([`${basePath}${AppConstants.IMAGES_PATH}**`]);
    await del([`${basePath}${AppConstants.VIDEO_PATH}**`]);
    this.logger.log('🚀 ~ CronService ~ Deletion done!');
  }
}
