import { Test, TestingModule } from '@nestjs/testing';
import { AudioConverterController } from './audio-converter.controller';

describe('AudioConverterController', () => {
  let controller: AudioConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioConverterController],
    }).compile();

    controller = module.get<AudioConverterController>(AudioConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
