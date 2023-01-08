import { Component, Input } from '@angular/core';
import { CountdownState } from '@enums/countdown-state';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-countdown-modal',
    templateUrl: './countdown.modal.html',
})
export class CountdownModalComponent {

    @Input() duration: number;
    @Input() message: string;

    public modal: HTMLElement;
    public countdownState: CountdownState;

    constructor(
        private modalController: ModalController
    ) {
        this.countdownState = CountdownState.stop;
    }

    public dismiss() {
        // can "dismiss" itself and optionally pass back data
        this.modalController.dismiss({
          dismissed: true
        });
      }

}
