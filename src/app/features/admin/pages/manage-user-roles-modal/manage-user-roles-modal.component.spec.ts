import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserRolesModalComponent } from './manage-user-roles-modal.component';

describe('ManageUserRolesModalComponent', () => {
  let component: ManageUserRolesModalComponent;
  let fixture: ComponentFixture<ManageUserRolesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageUserRolesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUserRolesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
