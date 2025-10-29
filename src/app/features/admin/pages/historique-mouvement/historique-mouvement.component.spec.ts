import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueMouvementComponent } from './historique-mouvement.component';

describe('HistoriqueMouvementComponent', () => {
  let component: HistoriqueMouvementComponent;
  let fixture: ComponentFixture<HistoriqueMouvementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueMouvementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueMouvementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
