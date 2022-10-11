import { Component } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { ModalController } from '@ionic/angular';
import { CountdownModalComponent } from '@pages/animator/modals/countdown/countdown.modal';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-record-audio-button',
  templateUrl: './record-audio-button.component.html',
  styleUrls: ['./record-audio-button.component.scss'],
})
export class RecordAudioButtonComponent extends BaseComponent {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService,
    private modalController: ModalController
  ) {
    super(baseService);
  }

  async onClick($event: any) {
    $event.preventDefault();
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      const hasAudio = this.animatorService.animator.audio;
      if (hasAudio) {
        this.baseService.alertService.presentAlert({
          header: this.baseService.translate.instant('alert_record_audio_animator_header'),
          message: this.baseService.translate.instant('alert_record_audio_animator_message'),
          buttons: [this.baseService.alertService.createCancelButton(), {
            text: this.baseService.translate.instant('buttons_delete'),
            handler: () => {
              this.animatorService.clearAudio();
            }
          }, {
            text: this.baseService.translate.instant('buttons_record_audio'),
            handler: async () => {
              this.animatorService.clearAudio();
              await this.recordAudio();
            }
          }]
        });
      } else {
        await this.recordAudio();
      }
    } else {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_record_audio_hint')
      });
    }
  }

  private async recordAudio() {
    const modal = await this.modalController.create({
      backdropDismiss: false,
      showBackdrop: true,
      component: CountdownModalComponent,
      componentProps: {
        duration: 3,
        message: 'loader_record_audio_message'
      }
    });
    await modal.present();
    await modal.onWillDismiss();
    const blob = await this.animatorService.recordAudio();
    await this.presentLoading();
    await this.animatorService.convertAudio(blob);
    this.dismissloading();
  }

}
