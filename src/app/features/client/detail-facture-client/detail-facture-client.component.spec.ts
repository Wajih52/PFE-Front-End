import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailFactureClientComponent } from './detail-facture-client.component';

describe('DetailFactureClientComponent', () => {
  let component: DetailFactureClientComponent;
  let fixture: ComponentFixture<DetailFactureClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailFactureClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailFactureClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
