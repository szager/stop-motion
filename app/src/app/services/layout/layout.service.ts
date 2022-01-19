import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@enums/screen-orientation.enum';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private layoutOptions: BehaviorSubject<LayoutOptions>;
  // used to store initial height/width
  private initialHeight: number;
  private initialWidth: number;

  constructor(
    private platform: Platform
  ) {

    this.initialHeight = this.platform.height();
    console.log('🚀 ~ file: layout.service.ts ~ line 23 ~ LayoutService ~ this.initialHeight', this.initialHeight);
    this.initialWidth = this.platform.width();
    console.log('🚀 ~ file: layout.service.ts ~ line 25 ~ LayoutService ~ this.initialWidth', this.initialWidth);

    this.layoutOptions = new BehaviorSubject({
      currentOrientation: this.platform.isPortrait() ? ScreenOrientation.portrait : ScreenOrientation.landscape,
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.initialHeight,
      width: this.initialWidth
    });
  }

  getLayoutOptions(): LayoutOptions {
    return this.layoutOptions.getValue();
  }

  public async toggleOrientation(orientation: ScreenOrientation): Promise<void> {
    console.log('🚀 ~ file: layout.service.ts ~ line 56 ~ LayoutService ~ toggleOrientation ~ orientation', orientation);
    console.log('🚀 ~ file: layout.service.ts ~ line 56 ~ toggleOrientation ~ this.initialHeight', this.initialHeight);
    console.log('🚀 ~ file: layout.service.ts ~ line 57 ~ toggleOrientation ~ this.initialWidth', this.initialWidth);
    let height: number;
    let width: number;
    if (this.platform.isPortrait()) {
      height = (this.initialHeight > this.initialWidth) ? this.initialHeight : this.initialWidth;
      width = (this.initialWidth < this.initialHeight) ? this.initialWidth : this.initialHeight;
    } else {
      height = (this.initialHeight < this.initialWidth) ? this.initialHeight : this.initialWidth;
      width = (this.initialWidth > this.initialHeight) ? this.initialWidth : this.initialHeight;
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        this.layoutOptions.next({
          currentOrientation: orientation,
          isLandscape: this.platform.isLandscape(),
          isPortrait: this.platform.isPortrait(),
          height,
          width
        });
        resolve();
      }, 10);
    });
  }
}
