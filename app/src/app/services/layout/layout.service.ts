import { Injectable } from '@angular/core';
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
      isLandscape: this.platform.isLandscape(),
      isPortrait: this.platform.isPortrait(),
      height: this.platform.height(),
      width: this.platform.width()
    });

    this.platform.resize.subscribe(() => {
      this.layoutOptions.next({
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
}
