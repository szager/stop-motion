import { Component } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-undo-button',
  templateUrl: './undo-button.component.html',
  styleUrls: ['./undo-button.component.scss'],
})
export class UndoButtonComponent {

  constructor(
    private animatorService: AnimatorService
  ) { }

  public onClick($event: Event): void {
    $event.preventDefault();
    this.animatorService.undoCapture();
  }

}
