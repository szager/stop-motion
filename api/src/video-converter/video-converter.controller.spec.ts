import { Test, TestingModule } from '@nestjs/testing';
import { VideoConverterController } from './video-converter.controller';

describe('VideoConverterController', () => {
  let controller: VideoConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoConverterController],
    }).compile();

    controller = module.get<VideoConverterController>(VideoConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
