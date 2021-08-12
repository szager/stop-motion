import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-rotate-button',
  templateUrl: './rotate-button.component.html',
  styleUrls: ['./rotate-button.component.scss'],
})
export class RotateButtonComponent implements OnInit {

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  public onClick() {
    this.animatorService.rotateCamera();
  }

}
