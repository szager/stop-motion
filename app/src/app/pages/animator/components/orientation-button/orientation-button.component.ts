import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first, last, takeUntil } from 'rxjs/operators';
import { ScreenOrientation } from '@enums/screen-orientation.enum';
import { BaseComponent } from '@components/base/base.component';
import { LayoutService } from '@services/layout/layout.service';

@Component({
  selector: 'app-orientation-button',
  templateUrl: './orientation-button.component.html',
  styleUrls: ['./orientation-button.component.scss'],
})
export class OrientationButtonComponent extends BaseComponent implements OnInit {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService,
    private layoutService: LayoutService
  ) {
    super(baseService);
  }

  ngOnInit() { }

  public async onClick() {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_change_orientation_hint')
      });
    } else {
      const layoutOptions = await this.layoutService.getLayoutOptions().pipe(first()).toPromise();
      this.baseService.alertService.presentAlert({
        header: this.baseService.translate.instant('alert_orientation_animator_header'),
        message: this.baseService.translate.instant('alert_orientation_animator_message'),
        inputs: [
          {
            name: 'radio1',
            type: 'radio',
            label: this.baseService.translate.instant('alert_orientation_animator_radio1_label'),
            value: ScreenOrientation.portrait,
            handler: () => {
              this.layoutService.toggleOrientation(ScreenOrientation.portrait);
              this.animatorService.toggleOrientation();
            },
            checked: (layoutOptions.currentOrientation === ScreenOrientation.portrait) ? true : false
          },
          {
            name: 'radio2',
            type: 'radio',
            label: this.baseService.translate.instant('alert_orientation_animator_radio2_label'),
            value: ScreenOrientation.landscape,
            handler: () => {
              this.layoutService.toggleOrientation(ScreenOrientation.landscape);
              this.animatorService.toggleOrientation();
            },
            checked: (layoutOptions.currentOrientation === ScreenOrientation.landscape) ? true : false
          }],
        buttons: [this.baseService.alertService.createConfirmButton(() => {})
        ]
      });
    }
  }

}
