import { TestBed } from '@angular/core/testing';

import { RippleEffectService } from './ripple-effect.service';

describe('RippleEffectService', () => {
  let service: RippleEffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RippleEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
