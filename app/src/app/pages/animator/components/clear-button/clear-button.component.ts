import { Component } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-clear-button',
  templateUrl: './clear-button.component.html',
  styleUrls: ['./clear-button.component.scss'],
})
export class ClearButtonComponent {

  constructor(
    public baseService: BaseService,
    public animatorService: AnimatorService
  ) { }

  public async onClick(): Promise<void> {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      this.baseService.alertService.presentAlert({
        header: this.baseService.translate.instant('alert_clear_animator_header'),
        message: this.baseService.translate.instant('alert_clear_animator_message'),
        buttons: [this.baseService.alertService.createCancelButton(),
        this.baseService.alertService.createConfirmButton(() => {
          this.animatorService.clear();
        })]
      });
    } else {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_clear_hint')
      });
    }
  }

}
