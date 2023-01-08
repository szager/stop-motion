import { Test, TestingModule } from '@nestjs/testing';
import { VideoConverterService } from './video-converter.service';

describe('VideoConverterService', () => {
  let service: VideoConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoConverterService],
    }).compile();

    service = module.get<VideoConverterService>(VideoConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
