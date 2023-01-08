import { TestBed } from '@angular/core/testing';

import { AnimatorService } from './animator.service';

describe('AnimatorService', () => {
  let service: AnimatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
