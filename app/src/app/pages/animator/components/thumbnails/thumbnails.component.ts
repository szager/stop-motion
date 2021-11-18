import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { IonSlides } from '@ionic/angular';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-thumbnails',
  templateUrl: './thumbnails.component.html',
  styleUrls: ['./thumbnails.component.scss'],
})
export class ThumbnailsComponent extends BaseComponent implements OnDestroy, OnInit {

  @ViewChild('thumbnailsContainer', { static: true }) public thumbnailsContainer: IonSlides;
  public slideOpts = {
    initialSlide: 0,
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
   this.list = this.animatorService.getFrames().pipe(tap((frames: HTMLCanvasElement[]) => {
      console.log(':rocket: ~ file: thumbnails.component.ts ~ line 39 ~ ThumbnailsComponent ~ this.getFrames ~ canvas', frames);
      this.thumbnailsContainer.slideTo(frames.length);
    })); 


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

  public onThumbnailClicked(index: number) {
    this.baseService.alertService.presentAlert({
      header: this.baseService.translate.instant('alert_thumbnail_delete_header'),
      message: null,
      buttons: [this.baseService.alertService.createCancelButton(), {
        text: this.baseService.translate.instant('buttons_yes'),
        handler: async () => {
          this.animatorService.removeFrames(index);
        }
      }]
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
