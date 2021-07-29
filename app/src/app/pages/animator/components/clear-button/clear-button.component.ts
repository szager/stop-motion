import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-clear-button',
  templateUrl: './clear-button.component.html',
  styleUrls: ['./clear-button.component.scss'],
})
export class ClearButtonComponent implements OnInit {

  constructor(
    public baseService: BaseService,
    public animatorService: AnimatorService
  ) { }

  ngOnInit() { }

  public onClick() {
    if (this.animatorService.animator.frames.length) {
      this.baseService.alertService.presentAlert({
        header: this.baseService.translate.instant('alert_clear_animator_header'),
        message: this.baseService.translate.instant('alert_clear_animator_message'),
        buttons: [this.baseService.alertService.createCancelButton(),
        this.baseService.alertService.createConfirmButton(() => {
          // TODO clear thumbnail container > thumbnailContainer.innerHTML = "";
          this.animatorService.animator.clear();
        })]
      });
    } else {
      this.baseService.toastService.showToast({
        message: this.baseService.translate.instant('toast_animator_clear_hint')
      });
    }
  }

}
