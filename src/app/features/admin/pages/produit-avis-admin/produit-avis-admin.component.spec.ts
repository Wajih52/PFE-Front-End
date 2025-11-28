import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitAvisAdminComponent } from './produit-avis-admin.component';

describe('ProduitAvisAdminComponent', () => {
  let component: ProduitAvisAdminComponent;
  let fixture: ComponentFixture<ProduitAvisAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitAvisAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitAvisAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
