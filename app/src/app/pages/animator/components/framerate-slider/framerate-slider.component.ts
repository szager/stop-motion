import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { IonRange } from '@ionic/angular';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-framerate-slider',
  templateUrl: './framerate-slider.component.html',
  styleUrls: ['./framerate-slider.component.scss'],
})
export class FramerateSliderComponent extends BaseComponent implements OnInit {

  @ViewChild('slider') slider: IonRange;
  public initalValue = 12;

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  ngOnInit() {
    // listener to update slider when webm file is loaded
    this.animatorService.animator.getFramerate().pipe(takeUntil(this.unsubscribe$)).subscribe((frameRate: number) => {
      if (this.slider && frameRate) {
        this.slider.value = frameRate;
      }
    });
  }

  onChange(value: any) {
    this.animatorService.animator.setFramerate(value);
  }

}
