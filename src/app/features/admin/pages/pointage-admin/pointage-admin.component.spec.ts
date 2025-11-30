import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointageAdminComponent } from './pointage-admin.component';

describe('PointageAdminComponent', () => {
  let component: PointageAdminComponent;
  let fixture: ComponentFixture<PointageAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointageAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
