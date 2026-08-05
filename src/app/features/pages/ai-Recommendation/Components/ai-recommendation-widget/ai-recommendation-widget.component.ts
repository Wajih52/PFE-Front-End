import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiRecommendationService } from '../../services/ai-recommendation.service';
import { AiRecommendationRequest } from '../../models/ai-recommendation.models';

@Component({
  selector: 'app-ai-recommendation-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-recommendation-widget.component.html',
  styleUrl: './ai-recommendation-widget.component.scss'
})
export class AiRecommendationWidgetComponent {

  isOpen = false;
  loading = false;
  recommendation = '';

  form: AiRecommendationRequest = {
    eventType: '',
    guestCount: 0,
    budget: 'Moyen',
    locationType: 'Intérieur',
    startDate: '',
    endDate: '',
    notes: ''
  };
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() datesValid = false;

  constructor(private aiRecommendationService: AiRecommendationService) {}

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  canGenerate(): boolean {
    return (
      !this.loading &&
      this.datesValid &&
      !!this.form.eventType &&
      Number(this.form.guestCount) > 0
    );
  }

  generateRecommendation(): void {
    if (!this.canGenerate()) {
      return;
    }

    const request: AiRecommendationRequest = {
      ...this.form,
      guestCount: Number(this.form.guestCount),
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.loading = true;
    this.recommendation = '';

    this.aiRecommendationService.generateEventPackRecommendation(request).subscribe({
      next: (response) => {
        this.recommendation = response.recommendation;
        this.loading = false;
      },
      error: () => {
        this.recommendation = 'Impossible de générer une recommandation pour le moment.';
        this.loading = false;
      }
    });
  }
}
