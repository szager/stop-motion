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

  private cameraIsRotated: BehaviorSubject<boolean>;
  private cameraStatus: BehaviorSubject<CameraStatus>;
  private frames: BehaviorSubject<HTMLCanvasElement[]>;

  constructor(
    public animator: Animator,
    public baseService: BaseService
  ) {
    this.cameraIsRotated = new BehaviorSubject(false);
    this.cameraStatus = new BehaviorSubject(CameraStatus.notStarted);
    this.frames = new BehaviorSubject([]);
  }

  getCameraStatus() {
    return this.cameraStatus.asObservable();
  }

  getFrames() {
    return this.frames.asObservable();
  }

  getCameraIsRotated() {
    return this.cameraIsRotated.asObservable();
  }

  public async init(video: ElementRef, snapshotCanvas: ElementRef, playerCanvas: ElementRef, videoMessage: ElementRef) {
    this.animator.init(video, snapshotCanvas, playerCanvas, videoMessage);
    await this.startCamera();
  }

  public async capture() {
    // console.log('🚀 ~ file: animator.service.ts ~ line 40 ~ AnimatorService ~ capture ~ capture');
    const frames = await this.animator.capture();
    // console.log('🚀 ~ file: animator.service.ts ~ line 41 ~ AnimatorService ~ capture ~ frame', frames);
    this.frames.next(frames);
    return;
  }

  public undoCapture() {
    const frames = this.animator.undoCapture();
    this.frames.next(frames);
    if (frames.length === 0) {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_undo_hint')
      });
    }
  }

  public rotateCamera() {
    this.animator.rotateCamera();
    this.cameraIsRotated.next(!this.cameraIsRotated.getValue());
  }

  public clear(): void {
    this.animator.clear();
    this.frames.next([]);
  }

  public async toggleCamera() {
    // TODO maybe add another state to isStreaming, like isPlaying
    this.cameraStatus.next(await this.animator.toggleCamera() ? CameraStatus.isStreaming : CameraStatus.hasPaused);
  }

  public async togglePlay() {
    // TODO maybe add another state to isStreaming, like isPlaying
    this.cameraStatus.next(CameraStatus.hasPaused);
    await this.animator.togglePlay();
    this.cameraStatus.next(CameraStatus.isStreaming);
    return;
  }

  public destroy(): void {
    this.animator.clear();
    this.animator.detachStream();
  }

  public async recordAudio(): Promise<void> {
    if (this.animator.isRecording) {
      this.animator.endPlay(null);
      this.animator.isRecording = false;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const result = await this.animator.recordAudio(stream);
      this.animator.isRecording = true;
    } else {
      this.animator.isRecording = false;
    }
    return;
  }

  public clearAudio(): void {
    this.animator.clearAudio();
  }

  public async save(filename: string) {
    if (!filename.length) {
      filename = 'StopMotion';
    }
    filename = filename.replace(/\s+/g, '_');
    filename = filename.replace(/[^\w\-\.]+/g, '');
    if (filename.endsWith('.mng')) {
      filename = filename.substring(0, filename.length - 4);

    }
    if (!filename.endsWith('.webm')) {
      filename += '.webm';
    }

    await this.animator.save(filename);
  }

  public async load(filepath: string): Promise<any> {
    return this.animator.load(filepath);
  }

  public formatTime(seconds: number) {
    return new Date(Math.round(seconds) * 1000).toISOString().substr(14, 5);
  }

  public delayTimer(milliSeconds: number): Promise<any> {
    return new Promise(res => setTimeout(res, milliSeconds));
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
