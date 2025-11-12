import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesDevisComponent } from './mes-devis.component';

describe('MesDevisComponent', () => {
  let component: MesDevisComponent;
  let fixture: ComponentFixture<MesDevisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesDevisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesDevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
