import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisCreateComponent } from './avis-create.component';

describe('AvisCreateComponent', () => {
  let component: AvisCreateComponent;
  let fixture: ComponentFixture<AvisCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
