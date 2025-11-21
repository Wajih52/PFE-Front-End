import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonsListComponent } from './livraisons-list.component';

describe('LivraisonsListComponent', () => {
  let component: LivraisonsListComponent;
  let fixture: ComponentFixture<LivraisonsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
