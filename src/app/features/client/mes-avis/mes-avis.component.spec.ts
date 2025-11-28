import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesAvisComponent } from './mes-avis.component';

describe('MesAvisComponent', () => {
  let component: MesAvisComponent;
  let fixture: ComponentFixture<MesAvisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesAvisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
