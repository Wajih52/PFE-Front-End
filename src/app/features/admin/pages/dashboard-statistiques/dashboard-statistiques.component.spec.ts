import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStatistiquesComponent } from './dashboard-statistiques.component';

describe('DashboardStatistiquesComponent', () => {
  let component: DashboardStatistiquesComponent;
  let fixture: ComponentFixture<DashboardStatistiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStatistiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardStatistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
