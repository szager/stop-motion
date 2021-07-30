import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-undo-button',
  templateUrl: './undo-button.component.html',
  styleUrls: ['./undo-button.component.scss'],
})
export class UndoButtonComponent implements OnInit {

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  onClick() {
    this.animatorService.undoCapture();
  }

}
