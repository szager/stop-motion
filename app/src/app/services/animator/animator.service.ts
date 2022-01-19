import { ElementRef, Injectable } from '@angular/core';
import { CameraStatus } from '@enums/camera-status.enum';
import { FacingMode } from '@enums/facing-mode.enum';
import { Animator } from '@models/animator';
import { BaseService } from '@services/base/base.service';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
/*
 * Anitmoar services provides interface to the Animator class, tracks events and will be used to communicate between components
 */
export class AnimatorService {

  private currentCameraIndex: number;
  private cameras: BehaviorSubject<MediaDeviceInfo[]>;
  private cameraIsRotated: BehaviorSubject<boolean>;
  private cameraStatus: BehaviorSubject<CameraStatus>;
  private facingMode: FacingMode;
  private frames: BehaviorSubject<HTMLCanvasElement[]>;

  constructor(
    public animator: Animator,
    public baseService: BaseService
  ) {
    this.cameras = new BehaviorSubject([]);
    this.currentCameraIndex = null;
    this.cameraIsRotated = new BehaviorSubject(false);
    this.cameraStatus = new BehaviorSubject(CameraStatus.notStarted);
    this.facingMode = FacingMode.user;
    this.frames = new BehaviorSubject([]);
  }

  getCameras() {
    return this.cameras.asObservable();
  }

  getCameraStatus() {
    return this.cameraStatus.asObservable();
  }

  getFrames() {
    return this.frames.asObservable();
  }

  removeFrames(index: number) {
    const frames = this.frames.getValue();
    frames.splice(index, 1);
    this.frames.next(frames);
  }

  getCameraIsRotated() {
    return this.cameraIsRotated.asObservable();
  }

  public async init(video: ElementRef, snapshotCanvas: ElementRef, playerCanvas: ElementRef) {
    const layoutOptions = this.baseService.layoutService.getLayoutOptions();
    this.animator.init(video, snapshotCanvas, playerCanvas, layoutOptions);
    await this.startCamera();
  }

  public async capture() {
    const frames = await this.animator.capture();
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
    const layoutOptions = this.baseService.layoutService.getLayoutOptions();
    console.log('🚀 ~ file: animator.service.ts ~ line 93 ~ AnimatorService ~ toggleCamera ~ layoutOptions', layoutOptions);
    this.cameraStatus.next(await this.animator.toggleCamera(layoutOptions) ? CameraStatus.isStreaming : CameraStatus.hasPaused);
  }

  public async togglePlay() {
    // TODO maybe add another state to isStreaming, like isPlaying
    this.cameraStatus.next(CameraStatus.hasPaused);
    await this.animator.togglePlay();
    this.cameraStatus.next(CameraStatus.isStreaming);
    return;
  }

  public async toggleOrientation() {
    const layoutOptions = this.baseService.layoutService.getLayoutOptions();
    await this.startCamera();
    console.log('🚀 ~ file: animator.service.ts ~ line 107 ~ AnimatorService ~ toggleOrientation ~ layoutOptions', layoutOptions);
    this.animator.setDimensions(layoutOptions);
  }

  public destroy(): void {
    this.animator.clear();
    this.frames.next([]);
    this.animator.detachStream();
  }

  public async recordAudio(): Promise<void> {
    if (this.animator.isRecording) {
      this.animator.endPlay(null);
      this.animator.isRecording = false;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const result = await this.animator.recordAudio(stream);
        console.log('🚀 ~ file: animator.service.ts ~ line 128 ~ AnimatorService ~ recordAudio ~ result', result);
        this.animator.isRecording = true;
      } catch (err) {
        console.log('🚀 ~ file: animator.service.ts ~ line 131 ~ AnimatorService ~ recordAudio ~ err', err);
        this.baseService.toastService.presentToast({
          message: this.baseService.translate.instant('toast_animator_audio_no_access')
        });
        this.animator.isRecording = false;
      }
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
    return await this.animator.save(filename);
  }

  public async load(filepath: string): Promise<any> {
    // before loading a new file clear all current data
    this.clear();
    await this.animator.load(filepath);
    this.frames.next(this.animator.frames);
    return;
  }

  public formatTime(seconds: number) {
    return new Date(Math.round(seconds) * 1000).toISOString().substr(14, 5);
  }

  public async switchCamera(): Promise<void> {
    this.animator.detachStream();
    this.cameraStatus.next(CameraStatus.hasPaused);
    const layoutOptions = this.baseService.layoutService.getLayoutOptions();
    const cameras = await this.cameras.pipe(first()).toPromise();
    const index = (this.currentCameraIndex === 0 && !this.baseService.plattform.is('ios')) ? 1 : 0;
    this.facingMode = (this.facingMode === FacingMode.user) ? FacingMode.environment : FacingMode.user;
    try {
      await this.animator.attachStream(cameras[index].deviceId, layoutOptions, this.facingMode);
      this.currentCameraIndex = index;
      this.cameraStatus.next(CameraStatus.isStreaming);
    } catch (err) {
      // fallback if only one camera is available e.g. on desktops
      await this.animator.attachStream(cameras[0].deviceId, layoutOptions, this.facingMode);
      this.currentCameraIndex = 0;
      this.cameraStatus.next(CameraStatus.isStreaming);
    }
  }

  private async startCamera(): Promise<void> {
    // Everything is set up, now connect to camera.
    if (window.navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      this.cameras.next(cameras);
      try {
        const layoutOptions = this.baseService.layoutService.getLayoutOptions();
        console.log('🚀 ~ file: animator.service.ts ~ line 199 ~ AnimatorService ~ startCamera ~ layoutOptions', layoutOptions);
        await this.animator.attachStream(cameras[0].deviceId, layoutOptions);
        this.currentCameraIndex = 0;
        this.cameraStatus.next(CameraStatus.isStreaming);
      } catch (err) {
        this.baseService.toastService.presentToast({
          message: this.baseService.translate.instant('toast_animator_camera_no_access')
        });
        this.cameraStatus.next(CameraStatus.noPermission);
      }
    }
  }
}
