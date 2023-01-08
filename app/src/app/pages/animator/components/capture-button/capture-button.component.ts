import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-capture-button',
  templateUrl: './capture-button.component.html',
  styleUrls: ['./capture-button.component.scss'],
})
export class CaptureButtonComponent {

  animated = false;

  constructor(
    private animatorService: AnimatorService
  ) { }

  async onClick($event: Event): Promise<void> {
    $event.preventDefault();
    await this.animatorService.capture();
    this.animated = !this.animated;
    this.delay(500).then(() => this.animated = false);
  }

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}
