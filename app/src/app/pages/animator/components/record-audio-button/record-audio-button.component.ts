import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-record-audio-button',
  templateUrl: './record-audio-button.component.html',
  styleUrls: ['./record-audio-button.component.scss'],
})
export class RecordAudioButtonComponent implements OnInit {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  async onClick() {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      await this.animatorService.recordAudio();
    } else {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_record_audio_hint')
      });
    }
  }

}
