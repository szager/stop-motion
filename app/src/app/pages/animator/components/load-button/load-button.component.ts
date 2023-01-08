import { Component, ElementRef, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-load-button',
  templateUrl: './load-button.component.html',
  styleUrls: ['./load-button.component.scss'],
})
export class LoadButtonComponent extends BaseComponent {

  @ViewChild('fileInput', { static: true }) public fileInput: ElementRef;

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  async onClick() {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();

    if (frames.length) {
      this.baseService.alertService.presentAlert({
        header: this.baseService.translate.instant('alert_load_hint_animator_header'),
        message: this.baseService.translate.instant('alert_load_hint_animator_message'),
        buttons: [this.baseService.alertService.createCancelButton(), {
          text: this.baseService.translate.instant('buttons_yes'),
          handler: () => {
            this.showUploadDialog();
          }
        }]
      });
    } else {
      this.showUploadDialog();
    }
  }

  public async onFile(event: any) {
    console.log('🚀 ~ file: load-button.component.ts ~ line 43 ~ LoadButtonComponent ~ onFile ~ event', event.target.files[0]);
    await this.presentLoading();
    await this.animatorService.load(event.target.files[0]);
    this.dismissloading();
  }

  private showUploadDialog() {
    this.baseService.alertService.presentAlert({
      header: this.baseService.translate.instant('alert_load_animator_header'),
      message: this.baseService.translate.instant('alert_load_animator_message'),
      buttons: [this.baseService.alertService.createCancelButton(), {
        text: this.baseService.translate.instant('buttons_select'),
        handler: () => {
          this.fileInput.nativeElement.click();
        }
      }]
    });
  }

}
