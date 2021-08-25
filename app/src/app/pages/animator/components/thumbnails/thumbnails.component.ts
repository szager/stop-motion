import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { IonSlides } from '@ionic/angular';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-thumbnails',
  templateUrl: './thumbnails.component.html',
  styleUrls: ['./thumbnails.component.scss'],
})
export class ThumbnailsComponent extends BaseComponent implements OnDestroy, OnInit {

  @ViewChild('thumbnailsContainer', { static: true }) public thumbnailsContainer: IonSlides;
  public slideOpts = {
    initialSlide: 1,
    speed: 100,
    slidesPerView: 5,
    spaceBetween: 0,
    pagination: {
      type: 'progressbar'
    },
    navigation: true
  };
  private interval = null;


  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService,
    private zone: NgZone
  ) {
    super(baseService);
  }

  ngOnInit() {
    this.list = this.animatorService.getFrames();

    this.animatorService.animator.getIsPlaying().pipe(takeUntil(this.unsubscribe$)).subscribe(async (isPlaying: boolean) => {
      if (isPlaying) {
        // reset slider if already moved
        this.thumbnailsContainer.slideTo(0);
        // first grab seconds based on number of frames and the selected playbackspeed
        const playbackSpeed = await this.animatorService.animator.getPlaybackSpeed().pipe(first()).toPromise();
        const seconds = Number((this.animatorService.animator.frames.length / playbackSpeed).toFixed(2));
        const frames = this.animatorService.animator.frames.length;
        // multiply the number of seconds by hundred to get interval and divide by number of frames
        const milliSeconds = (seconds * 1000) /  frames;
        // internval has to be run outside of the angular zone
        this.zone.runOutsideAngular(() => {
          this.interval = setInterval(() => {
            this.thumbnailsContainer.slideNext();
          // multiply interval delay by 40 % to slow slider down
          }, milliSeconds * 1.4);
        });
      } else {
        // if player has stopped playing slide to first slide and clear interval
        this.thumbnailsContainer.slideTo(0);
        this.clearInterval();
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.clearInterval();
  }

  private clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

}
