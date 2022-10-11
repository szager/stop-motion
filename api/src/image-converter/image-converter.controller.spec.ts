import { Test, TestingModule } from '@nestjs/testing';
import { ImageConverterController } from './image-converter.controller';

describe('ImageConverterController', () => {
  let controller: ImageConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageConverterController],
    }).compile();

    controller = module.get<ImageConverterController>(ImageConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
