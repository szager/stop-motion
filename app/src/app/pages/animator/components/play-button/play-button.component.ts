import { Component } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
})
export class PlayButtonComponent {

  constructor(
    private animatorService: AnimatorService
  ) { }


  async onClick($event: Event): Promise<void> {
    $event.preventDefault();
    await this.animatorService.togglePlay();
  }

}
