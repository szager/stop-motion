import { Component, ElementRef, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { CameraStatus } from 'src/app/enums/camera-status';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent extends BaseComponent {

  @ViewChild('video', { static: true }) public video: ElementRef;

  public cameraStatus = CameraStatus;

  constructor(
    public animatorServcie: AnimatorService,
    public baseServcie: BaseService
  ) {
    super(baseServcie);
    this.state = this.animatorServcie.getCameraStatus();
  }
}
