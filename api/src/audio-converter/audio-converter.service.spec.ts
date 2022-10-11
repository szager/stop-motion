import { Test, TestingModule } from '@nestjs/testing';
import { AudioConverterService } from './audio-converter.service';

describe('AudioConverterService', () => {
  let service: AudioConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioConverterService],
    }).compile();

    service = module.get<AudioConverterService>(AudioConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
