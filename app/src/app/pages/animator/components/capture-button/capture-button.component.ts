import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-capture-button',
  templateUrl: './capture-button.component.html',
  styleUrls: ['./capture-button.component.scss'],
})
export class CaptureButtonComponent implements OnInit {
  animated: boolean = false;
  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  async onClick() {
    await this.animatorService.capture();
    this.animated = !this.animated;
    this.delay(500).then(() => this.animated = false);
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}
