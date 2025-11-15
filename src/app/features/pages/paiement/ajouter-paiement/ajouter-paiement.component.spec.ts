import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterPaiementComponent } from './ajouter-paiement.component';

describe('AjouterPaiementComponent', () => {
  let component: AjouterPaiementComponent;
  let fixture: ComponentFixture<AjouterPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
