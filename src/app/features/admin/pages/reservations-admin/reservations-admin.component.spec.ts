import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsAdminComponent } from './reservations-admin.component';

describe('ReservationsAdminComponent', () => {
  let component: ReservationsAdminComponent;
  let fixture: ComponentFixture<ReservationsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
