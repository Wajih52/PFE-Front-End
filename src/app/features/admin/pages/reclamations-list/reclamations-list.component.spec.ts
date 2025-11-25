import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationsListComponent } from './reclamations-list.component';

describe('ReclamationsListComponent', () => {
  let component: ReclamationsListComponent;
  let fixture: ComponentFixture<ReclamationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
