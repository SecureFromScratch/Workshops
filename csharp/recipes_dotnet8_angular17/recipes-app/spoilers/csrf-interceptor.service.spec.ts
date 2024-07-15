import { TestBed } from '@angular/core/testing';

import { CsrfInterceptor } from './csrf-interceptor.service';

describe('CsrfInterceptorService', () => {
  let service: CsrfInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsrfInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
