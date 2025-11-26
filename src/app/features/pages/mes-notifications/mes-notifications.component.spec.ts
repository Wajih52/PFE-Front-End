import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesNotificationsComponent } from './mes-notifications.component';

describe('MesNotificationsComponent', () => {
  let component: MesNotificationsComponent;
  let fixture: ComponentFixture<MesNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
