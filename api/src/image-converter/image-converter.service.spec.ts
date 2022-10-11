import { Test, TestingModule } from '@nestjs/testing';
import { ImageConverterService } from './image-converter.service';

describe('ImageConverterService', () => {
  let service: ImageConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageConverterService],
    }).compile();

    service = module.get<ImageConverterService>(ImageConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
