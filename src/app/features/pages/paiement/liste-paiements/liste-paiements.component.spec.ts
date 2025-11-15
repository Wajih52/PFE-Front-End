import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListePaiementsComponent } from './liste-paiements.component';

describe('ListePaiementsComponent', () => {
  let component: ListePaiementsComponent;
  let fixture: ComponentFixture<ListePaiementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListePaiementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListePaiementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
