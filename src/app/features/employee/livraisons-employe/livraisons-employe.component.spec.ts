import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonsEmployeComponent } from './livraisons-employe.component';

describe('LivraisonsEmployeComponent', () => {
  let component: LivraisonsEmployeComponent;
  let fixture: ComponentFixture<LivraisonsEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonsEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonsEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
