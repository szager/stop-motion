import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {

  public currenttime: string;

  constructor(
    private animatorService: AnimatorService
  ) {
    this.currenttime = '00:00';
  }

  ngOnInit() {
    this.animatorService.animator.getIsPlaying().subscribe((isPlaying: boolean) => {
      console.log('🚀 ~ file: timer.component.ts ~ line 21 ~ TimerComponent ~ isPlaying', isPlaying);
      console.log('🚀 ~ file: timer.component.ts ~ line 21 ~ TimerComponent ~ isPlaying', this.animatorService.animator.playbackSpeed);
    });

    this.animatorService.getFrames().subscribe((frames: any) => {
    console.log('🚀 ~ file: timer.component.ts ~ line 25 ~ TimerComponent ~ this.animatorService.getFrames ~ frames', frames.length);
    });
  }

}
