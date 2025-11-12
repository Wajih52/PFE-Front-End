import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisValidationComponent } from './devis-validation.component';

describe('DevisValidationComponent', () => {
  let component: DevisValidationComponent;
  let fixture: ComponentFixture<DevisValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
