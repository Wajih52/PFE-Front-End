import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonEditComponent } from './livraison-edit.component';

describe('LivraisonEditComponent', () => {
  let component: LivraisonEditComponent;
  let fixture: ComponentFixture<LivraisonEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
