import { TestBed } from '@angular/core/testing';

import { AnimatorGuard } from './animator.guard';

describe('AnimatorGuard', () => {
    let service: AnimatorGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AnimatorGuard);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
