import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { IonSlides } from '@ionic/angular';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-thumbnails',
  templateUrl: './thumbnails.component.html',
  styleUrls: ['./thumbnails.component.scss'],
})
export class ThumbnailsComponent extends BaseComponent implements OnDestroy, OnInit {

  @ViewChild('thumbnailsContainer', { static: true }) public thumbnailsContainer: IonSlides;
  public slideOpts = {
    initialSlide: 1,
    speed: 400,
    slidesPerView: 6,
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

    this.animatorService.animator.getIsPlaying().subscribe((isPlaying: boolean) => {
      if (isPlaying) {
        // first grab seconds based on number of frames and the selected playbackspeed
        const seconds = (this.animatorService.animator.frames.length / this.animatorService.animator.playbackSpeed).toFixed(2);
        // internval has to be run outside of the angular zone
        this.zone.runOutsideAngular(() => {
          this.interval = setInterval(() => {
            this.thumbnailsContainer.slideNext();
          // multiply the number of seconds by hundred to get interval
          }, Number(seconds) * 100);

        });
      } else {
        // if player has stopped playing slide to first slide and clear interval
        this.thumbnailsContainer.slideTo(0);
        this.clearInterval();
      }
    });
  }

  ngOnDestroy() {
    this.clearInterval();
  }

  private clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

}
