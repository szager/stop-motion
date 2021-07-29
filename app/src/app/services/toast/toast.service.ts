import { Injectable } from '@angular/core';
import { ToastOptions } from '@interfaces/toast-options.interface';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
/*
 * ToastService offers access to native toast notifications
 */
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }

  async showToast(options: ToastOptions) {
      const toast = await this.toastController.create({
        color: options.color || 'warning',
        message: options.message,
        duration: options.duration || 5000,
        position: 'bottom'
      });

      await toast.present();
  }
}
