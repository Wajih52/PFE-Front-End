import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutWithSidbarComponent } from './layout-with-sidbar.component';

describe('LayoutWithSidbarComponent', () => {
  let component: LayoutWithSidbarComponent;
  let fixture: ComponentFixture<LayoutWithSidbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutWithSidbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutWithSidbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
