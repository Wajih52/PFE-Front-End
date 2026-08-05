import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiRecommendationWidgetComponent } from './ai-recommendation-widget.component';

describe('AiRecommendationWidgetComponent', () => {
  let component: AiRecommendationWidgetComponent;
  let fixture: ComponentFixture<AiRecommendationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiRecommendationWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiRecommendationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
