import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {

  public isPlaying = false;
  public playTime = '00:00';
  public totalTime = '00:00';

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {
    this.animatorService.animator.getIsPlaying().subscribe((isPlaying: boolean) => {
      if (isPlaying) {
        const seconds = Number((this.animatorService.animator.frames.length / this.animatorService.animator.playbackSpeed).toFixed(2));
        this.totalTime = this.animatorService.formatTime(seconds);
          for (let i = 1; i <= seconds; i++) {
            setTimeout(() => {
              this.playTime = this.animatorService.formatTime(i);
            }, i * 1000);
          }
      } else {
        this.playTime = '00:00';
        this.totalTime = '00:00';
      }
      this.isPlaying = isPlaying;
    });
  }

}
