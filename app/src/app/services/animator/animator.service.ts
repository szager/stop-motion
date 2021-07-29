import { ElementRef, Injectable } from '@angular/core';
import { Animator } from '@models/animator';

@Injectable({
  providedIn: 'root'
})
/*
 * Anitmoar services provides interface to the Animator class, tracks events and will be used to communicate between components
 */
export class AnimatorService {

  public animator: Animator;

  constructor() { }

  public async init(video: ElementRef, snapshotCanvas: ElementRef, playerCanvas: ElementRef, videoMessage: ElementRef) {
    this.animator = new Animator(video, snapshotCanvas, playerCanvas, videoMessage);
    await this.startCamera();
  }

  public clear() {
    this.animator.clear();
  }

  private async startCamera(): Promise<void> {
        // Everything is set up, now connect to camera.
        if (window.navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log('🚀 ~ file: animator.page.ts ~ line 45 ~ AnimatorPage ~ ngAfterViewInit ~ devices', devices);
          const cameras = devices.filter(d =>  d.kind === 'videoinput').map(d => d.deviceId);
          console.log('🚀 ~ file: animator.service.ts ~ line 23 ~ AnimatorService ~ startCamera ~ cameras', cameras);
          this.animator.attachStream(cameras[0]);
        } else {
          this.animator.attachStream(null);
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
