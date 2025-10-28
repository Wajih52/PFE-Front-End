// scroll.service.ts
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    window.scrollTo({
      top: 0,
      behavior
    });
  }

  scrollToElement(elementId: string, behavior: ScrollBehavior = 'smooth'): void {
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior,
        block: 'start'
      });
    }
  }

  scrollToFirstError(): void {
    const firstErrorElement = this.document.querySelector('.ng-invalid, .alert-danger');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      this.scrollToTop();
    }
  }
}
