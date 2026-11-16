import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CongesEmployeComponent } from './conges-employe.component';

describe('CongesEmployeComponent', () => {
  let component: CongesEmployeComponent;
  let fixture: ComponentFixture<CongesEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongesEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CongesEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
