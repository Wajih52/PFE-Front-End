import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouvelleReclamationComponent } from './nouvelle-reclamation.component';

describe('NouvelleReclamationComponent', () => {
  let component: NouvelleReclamationComponent;
  let fixture: ComponentFixture<NouvelleReclamationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouvelleReclamationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouvelleReclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
