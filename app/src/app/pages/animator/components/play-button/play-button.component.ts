import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
})
export class PlayButtonComponent implements OnInit {

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  async onClick() {
    await this.animatorService.togglePlay();
  }


}
