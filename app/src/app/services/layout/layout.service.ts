import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@enums/screen-orientation.enum';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

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

    this.platform.resize.subscribe(() => {
      let height;
      let width;

      if (this.platform.isPortrait()) {
          height = (this.initialHeight >= this.initialWidth) ? this.initialHeight : this.initialWidth;
          width = (this.initialHeight >= this.initialWidth) ? this.initialWidth : this.initialHeight;
      }

      if (this.platform.isLandscape()) {
        height = (this.initialWidth >= this.initialHeight) ? this.initialHeight : this.initialWidth;
        width = (this.initialWidth >= this.initialHeight) ? this.initialWidth : this.initialHeight;
    }

      console.log('🚀 ~ file: layout.service.ts ~ line 76 ~ LayoutService ~ this.platform.resize.subscribe ~ width', width);
      console.log('🚀 ~ file: layout.service.ts ~ line 76 ~ LayoutService ~ this.platform.resize.subscribe ~ height', height);

      this.layoutOptions.next({
        currentOrientation: this.platform.isPortrait() ? ScreenOrientation.portrait : ScreenOrientation.landscape,
        isLandscape: this.platform.isLandscape(),
        isPortrait: this.platform.isPortrait(),
        height,
        width
      });
    });
  }

  getLayoutOptions(): Observable<LayoutOptions> {
    return this.layoutOptions.asObservable();
  }
}
