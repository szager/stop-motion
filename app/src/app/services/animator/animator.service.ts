import { ElementRef, Injectable } from '@angular/core';
import { Animator } from '@models/animator';
import { BaseService } from '@services/base/base.service';
import { BehaviorSubject } from 'rxjs';
import { CameraStatus } from 'src/app/enums/camera-status';

@Injectable({
  providedIn: 'root'
})
/*
 * Anitmoar services provides interface to the Animator class, tracks events and will be used to communicate between components
 */
export class AnimatorService {

  private cameraStatus: BehaviorSubject<CameraStatus>;

  constructor(
    public animator: Animator,
    public baseService: BaseService
  ) {
    this.cameraStatus = new BehaviorSubject(CameraStatus.notStarted);
  }

  getCameraStatus() {
    return this.cameraStatus.asObservable();
  }

  public async init(video: ElementRef, snapshotCanvas: ElementRef, playerCanvas: ElementRef, videoMessage: ElementRef) {
    this.animator.init(video, snapshotCanvas, playerCanvas, videoMessage);
    await this.startCamera();
  }

  public clear() {
    this.animator.clear();
  }

  private async startCamera(): Promise<void> {
    // Everything is set up, now connect to camera.
    if (window.navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput').map(d => d.deviceId);
      try {
        await this.animator.attachStream(cameras[0]);
        this.cameraStatus.next(CameraStatus.isStreaming);
      } catch (err) {
        this.baseService.toastService.presentToast({
          message: this.baseService.translate.instant('toast_animator_camera_no_access')
        });
        this.cameraStatus.next(CameraStatus.noPermission);
      }
    }

    // const videoColumnDiv = document.getElementById('video-column');
    // const selectDiv = document.createElement('div');
    // videoColumnDiv.appendChild(selectDiv);
    // const cameraSelect = document.createElement('select');
    // cameraSelect.id = 'camera-select';
    // selectDiv.appendChild(cameraSelect);
    // for (let i = 0; i < cameras.length; i++) {
    //   const cameraOption = document.createElement('option');
    //   cameraOption.value = cameras[i];
    //   cameraOption.innerText = 'Camera ' + (i + 1);
    //   cameraSelect.appendChild(cameraOption);
    //   if (i === 0) {
    //     cameraOption.selected = true;
    //   }
    // }
    // cameraSelect.onchange = (e: any) => {
    //   this.animator.detachStream();
    //   this.animator.attachStream(e.target.value);
    // };
  }
}
