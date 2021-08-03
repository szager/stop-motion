import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
})
export class ToggleButtonComponent implements OnInit {

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  async onClick() {
    await this.animatorService.toggleCamera();
  }

}
