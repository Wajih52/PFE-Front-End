import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisStatistiquesComponent } from './avis-statistiques.component';

describe('AvisStatistiquesComponent', () => {
  let component: AvisStatistiquesComponent;
  let fixture: ComponentFixture<AvisStatistiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisStatistiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisStatistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
