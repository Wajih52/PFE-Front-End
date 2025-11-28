import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisModerationComponent } from './avis-moderation.component';

describe('AvisModerationComponent', () => {
  let component: AvisModerationComponent;
  let fixture: ComponentFixture<AvisModerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisModerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
