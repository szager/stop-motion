import { Test, TestingModule } from '@nestjs/testing';
import { VideoCreatorService } from './video-creator.service';

describe('VideoCreatorService', () => {
  let service: VideoCreatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoCreatorService],
    }).compile();

    service = module.get<VideoCreatorService>(VideoCreatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
