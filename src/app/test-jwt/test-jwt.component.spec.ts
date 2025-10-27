import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestJwtComponent } from './test-jwt.component';

describe('TestJwtComponent', () => {
  let component: TestJwtComponent;
  let fixture: ComponentFixture<TestJwtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestJwtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestJwtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
