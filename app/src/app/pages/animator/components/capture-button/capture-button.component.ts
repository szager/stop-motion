import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-capture-button',
  templateUrl: './capture-button.component.html',
  styleUrls: ['./capture-button.component.scss'],
})
export class CaptureButtonComponent implements OnInit {

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  async onClick() {
    await this.animatorService.capture();
  }

}
