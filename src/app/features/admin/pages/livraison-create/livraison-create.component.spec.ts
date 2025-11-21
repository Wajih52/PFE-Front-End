import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonCreateComponent } from './livraison-create.component';

describe('LivraisonCreateComponent', () => {
  let component: LivraisonCreateComponent;
  let fixture: ComponentFixture<LivraisonCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
