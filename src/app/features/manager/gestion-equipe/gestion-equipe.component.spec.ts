import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEquipeComponent } from './gestion-equipe.component';

describe('GestionEquipeComponent', () => {
  let component: GestionEquipeComponent;
  let fixture: ComponentFixture<GestionEquipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEquipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEquipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
