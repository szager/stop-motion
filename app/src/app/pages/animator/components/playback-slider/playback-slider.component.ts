import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-playback-slider',
  templateUrl: './playback-slider.component.html',
  styleUrls: ['./playback-slider.component.scss'],
})
export class PlaybackSliderComponent implements OnInit {

  public initalValue = 12;

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  onChange(value: number) {
    this.animatorService.animator.setPlaybackSpeed(value);
  console.log('🚀 ~ file: playback-slider.component.ts ~ line 15 ~ PlaybackSliderComponent ~ onChange ~ value', value);
  }

}
