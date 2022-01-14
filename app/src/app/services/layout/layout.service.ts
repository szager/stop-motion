import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@enums/screen-orientation.enum';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
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
    this.initialWidth = this.platform.width();

    this.layoutOptions = new BehaviorSubject({
      currentOrientation: this.platform.isPortrait() ? ScreenOrientation.portrait : ScreenOrientation.landscape,
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.initialHeight,
      width: this.initialWidth
    });

    this.platform.resize.subscribe(() => {
      this.layoutOptions.next({
        currentOrientation: this.platform.isPortrait() ? ScreenOrientation.portrait : ScreenOrientation.landscape,
        isLandscape: this.platform.isLandscape(),
        isPortrait: this.platform.isPortrait(),
      // additional check here because Ionic seems to have issues retrieving the correct height once orientation has been changed once
        height: (this.platform.isPortrait() && this.platform.height() <= this.platform.width())
        ? this.initialHeight : this.platform.height(),
        width: this.platform.width()
      });
    });
  }

  getLayoutOptions(): Observable<LayoutOptions> {
    return this.layoutOptions.asObservable();
  }

  public async toggleOrientation(orientation: ScreenOrientation) {
    this.layoutOptions.next({
      currentOrientation: orientation,
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.platform.height(),
      width: this.platform.width()
    });
  }
}
