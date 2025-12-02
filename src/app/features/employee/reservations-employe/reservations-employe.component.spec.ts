import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsEmployeComponent } from './reservations-employe.component';

describe('ReservationsEmployeComponent', () => {
  let component: ReservationsEmployeComponent;
  let fixture: ComponentFixture<ReservationsEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
