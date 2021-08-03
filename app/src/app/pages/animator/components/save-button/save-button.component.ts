import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-save-button',
  templateUrl: './save-button.component.html',
  styleUrls: ['./save-button.component.scss'],
})
export class SaveButtonComponent implements OnInit {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) { }

  ngOnInit() { }

  async onClick() {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      this.baseService.alertService.presentAlert({
        header: this.baseService.translate.instant('alert_save_animator_header'),
        message: this.baseService.translate.instant('alert_save_animator_message'),
        inputs: [
          {
            name: 'filename',
            type: 'text',
            placeholder: this.baseService.translate.instant('labels_filename')
          },],
        buttons: [this.baseService.alertService.createCancelButton(), {
          text: this.baseService.translate.instant('buttons_save'),
          handler: (inputData: any) => {
            this.animatorService.save(inputData.filename);
          }
        }]
      });
    } else {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_save_hint')
      });
    }
  }

}
