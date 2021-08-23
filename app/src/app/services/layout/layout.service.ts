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

  constructor(
    private platform: Platform
  ) {

    this.layoutOptions = new BehaviorSubject({
      currentOrientation: this.platform.isPortrait() ? ScreenOrientation.portrait : ScreenOrientation.landscape,
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.platform.height(),
      width: this.platform.width()
    });

    this.platform.resize.subscribe(() => {
      this.layoutOptions.next({
        currentOrientation: this.layoutOptions.getValue().currentOrientation,
        isLandscape: this.platform.isLandscape(),
        isPortrait: this.platform.isPortrait(),
        height: this.platform.height(),
        width: this.platform.width()
      });
    });
  }

  getLayoutOptions(): Observable<LayoutOptions> {
    return this.layoutOptions.asObservable();
  }

  public async toggleOrientation(orientation: ScreenOrientation) {
    console.log('🚀 ~ file: animator.service.ts ~ line 103 ~ AnimatorService ~ toggleOrientation ~ orientation', orientation);
    this.layoutOptions.next({
      currentOrientation: orientation,
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.platform.height(),
      width: this.platform.width()
    });
  }
}
