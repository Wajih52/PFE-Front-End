import { TestBed } from '@angular/core/testing';

import { InstanceProduitService } from './instance-produit.service';

describe('InstanceProduitService', () => {
  let service: InstanceProduitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstanceProduitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
