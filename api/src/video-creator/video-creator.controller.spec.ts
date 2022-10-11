import { Test, TestingModule } from '@nestjs/testing';
import { VideoCreatorController } from './video-creator.controller';

describe('VideoCreatorController', () => {
  let controller: VideoCreatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoCreatorController],
    }).compile();

    controller = module.get<VideoCreatorController>(VideoCreatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
