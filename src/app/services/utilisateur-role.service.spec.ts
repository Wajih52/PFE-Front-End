import { TestBed } from '@angular/core/testing';

import { UtilisateurRoleService } from './utilisateur-role.service';

describe('UtilisateurRoleService', () => {
  let service: UtilisateurRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilisateurRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
