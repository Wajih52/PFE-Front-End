import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisEditComponent } from './avis-edit.component';

describe('AvisEditComponent', () => {
  let component: AvisEditComponent;
  let fixture: ComponentFixture<AvisEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
