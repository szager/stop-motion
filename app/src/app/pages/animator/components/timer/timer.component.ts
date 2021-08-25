import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent extends BaseComponent implements OnDestroy, OnInit {

  public playTime = '00:00';
  public totalTime = '00:00';
  private currentSecond = 0;
  private interval = null;

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  ngOnInit() {
    // subscribe to player is playing
    this.animatorService.animator.getIsPlaying().pipe(takeUntil(this.unsubscribe$)).subscribe(async (isPlaying: boolean) => {
      if (isPlaying) {
        const playbackSpeed = await this.animatorService.animator.getPlaybackSpeed().pipe(first()).toPromise();
        const seconds = Number((this.animatorService.animator.frames.length / playbackSpeed).toFixed(2));
        this.interval = this.setDelay(seconds);
      } else {
        this.clearInterval();
        this.currentSecond = 0;
        this.playTime = '00:00';
      }
      this.isPlaying = isPlaying;
    });
    // subscribe to frames
    this.animatorService.getFrames().pipe(takeUntil(this.unsubscribe$)).subscribe(async (frames: any[]) => {
      if (frames.length) {
        const playbackSpeed = await this.animatorService.animator.getPlaybackSpeed().pipe(first()).toPromise();
        const seconds = Number((this.animatorService.animator.frames.length / playbackSpeed).toFixed(2));
        this.totalTime = this.animatorService.formatTime(seconds);
      }
    });
    // subscribe to playback speed
    this.animatorService.animator.getPlaybackSpeed().pipe(takeUntil(this.unsubscribe$)).subscribe(async (playbackSpeed: number) => {
      if (this.animatorService.animator.frames) {
        const seconds = Number((this.animatorService.animator.frames.length / playbackSpeed).toFixed(2));
        this.totalTime = this.animatorService.formatTime(seconds);
      }
    });
  }

  ngOnDestroy() {
    this.clearInterval();
  }

  private setDelay(seconds: number) {
    return setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.interval);
      }
      if (this.currentSecond <= seconds) {
        this.currentSecond++;
      }
      this.playTime = this.animatorService.formatTime(this.currentSecond);
    }, 1000);
  }

  private clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

}
