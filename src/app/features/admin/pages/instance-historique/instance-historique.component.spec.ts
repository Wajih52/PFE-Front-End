import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceHistoriqueComponent } from './instance-historique.component';

describe('InstanceHistoriqueComponent', () => {
  let component: InstanceHistoriqueComponent;
  let fixture: ComponentFixture<InstanceHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceHistoriqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
