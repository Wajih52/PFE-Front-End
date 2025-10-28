import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstancesFormComponent } from './instance-form.component';

describe('InstancesFormComponent', () => {
  let component: InstancesFormComponent;
  let fixture: ComponentFixture<InstancesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstancesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstancesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
