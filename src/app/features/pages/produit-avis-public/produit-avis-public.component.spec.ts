import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitAvisPublicComponent } from './produit-avis-public.component';

describe('ProduitAvisPublicComponent', () => {
  let component: ProduitAvisPublicComponent;
  let fixture: ComponentFixture<ProduitAvisPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitAvisPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitAvisPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
