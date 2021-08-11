import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent extends BaseComponent implements OnInit {

  public isPlaying = false;
  public playTime = '00:00';
  public totalTime = '00:00';

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  ngOnInit() {
    this.animatorService.animator.getIsPlaying().pipe(takeUntil(this.unsubscribe$)).subscribe((isPlaying: boolean) => {
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
