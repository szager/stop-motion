import { Injectable } from '@angular/core';
import { AlertOptions } from '@interfaces/alert-options.interface';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alertController: AlertController,
    private translate: TranslateService
  ) { }

  /*
 * A method to display alert
 */
  async presentAlert(options: AlertOptions) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: options.header,
      message: options.message,
      buttons: options.buttons || [],
      inputs: options.inputs || []
    });

    await alert.present();
  }

  public createConfirmButton(handler: () => void) {
    return {
      text: 'OK',
      handler
    };
  }

  public createCancelButton(): any {
    return {
      text: this.translate.instant('buttons_cancel'),
      role: 'cancel',
      cssClass: 'secondary'
    };
  }
}
