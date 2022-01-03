import { Injectable } from '@angular/core';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { Platform } from '@ionic/angular';
import { BaseService } from '@services/base/base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import * as WebMWriter from 'webm-writer';
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const WebPEncoder: any;
declare const webm: any;
@Injectable({
    providedIn: 'root'
})
export class Animator {
    audio: any;
    audioBlob: any;
    audioChunks: any[];
    audioRecorder: MediaRecorder;
    exported: any;
    rotated: boolean;
    frames: any[];
    framesInFlight: number;
    frameWebps: any[];
    height: number;
    isStreaming: boolean;
    isRecording: boolean;
    loadFinishPending: boolean;
    messageDiv: any;
    name: any;
    // playbackSpeed: number;
    playCanvas: any;
    playContext: any;
    playTimer: any;
    snapshotCanvas: any;
    snapshotContext: any;
    video: any;
    videoSourceId: any;
    videoStream: any;
    width: any;
    zeroPlayTime: number;

    private isAnimatorPlaying: BehaviorSubject<boolean>;
    private frameRate: BehaviorSubject<number>;

    constructor(
        // TODO if possibole get rid of injectable again
        public baseService: BaseService,
        private platform: Platform
    ) {
        this.isAnimatorPlaying = new BehaviorSubject(false);
        this.frameRate = new BehaviorSubject(12.0);
    }

    getIsPlaying(): Observable<any> {
        return this.isAnimatorPlaying.asObservable();
    }

    getFramerate(): Observable<any> {
        return this.frameRate.asObservable();
    }

    /*
    * Init method is used to initialize properties
    */
    public init(video, snapshotCanvas, playCanvas, layoutOptions): void {
        this.audio = null;
        this.audioBlob = null;
        this.audioChunks = [];
        this.audioRecorder = null;
        this.frames = [];
        this.framesInFlight = 0;
        this.frameWebps = [];
        this.isStreaming = true;
        this.loadFinishPending = false;
        this.name = null;
        // this.playbackSpeed = 12.0;
        this.playCanvas = playCanvas;
        this.playContext = playCanvas.getContext('2d');
        this.playTimer = null;
        this.rotated = false;
        this.snapshotCanvas = snapshotCanvas;
        this.snapshotContext = snapshotCanvas.getContext('2d');
        this.video = video;
        this.videoStream = null;
        this.zeroPlayTime = 0;

        this.setDimensions(layoutOptions);
    }

    /*
    * Method is used to attach a media stream to the video component
    */
    public async attachStream(sourceId: any, layoutOptions: LayoutOptions, facingMode?: string): Promise<any> {
        const constraints = {
            audio: false,
            frameRate: 15,
            video: null
        };

        facingMode = facingMode ? facingMode : 'user';

        if (this.platform.is('ios') || this.platform.is('android')) {
            constraints.video = {
                // strange bug - width and height needs to be swaped
                width: layoutOptions.height,
                height: layoutOptions.width,
                facingMode
            };
        } else {
            if (sourceId) {
                constraints.video = {
                    width: layoutOptions.width,
                    height: layoutOptions.height,
                    sourceId
                };
            } else {
                constraints.video = true;
            }
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            this.videoStream = stream;
            this.isStreaming = true;
            return stream;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /*
    * Method is used to capture new image and create canvas out of it and share it with other components
    */
    public async capture() {
        // console.log('🚀 ~ file: animator.ts ~ line 103 ~ Animator ~ capture ~ capture');
        if (!this.isStreaming) { return; }
        const imageCanvas: HTMLCanvasElement = document.createElement('canvas');
        imageCanvas.width = this.width;
        imageCanvas.height = this.height;
        const context = imageCanvas.getContext('2d', { alpha: false });
        if (this.rotated) {
            context.rotate(Math.PI);
            context.translate(-this.width, -this.height);
        }
        context.drawImage(this.video, 0, 0, this.width, this.height);
        this.frames.push(imageCanvas);

        const promise = new Promise(((resolve, reject) => {
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
            this.snapshotContext.drawImage(imageCanvas, 0, 0, this.width, this.height);
            imageCanvas.toBlob(blob => { resolve(blob); }, 'image/webp');
        }));
        this.frameWebps.push(promise);
        return this.frames;
    }

    /*
    * Method is used to undo last action and delete snapshot
    */
    public undoCapture() {
        this.frames.pop();
        this.frameWebps.pop();
        if (this.frames.length) {
            this.drawFrame(this.frames.length - 1, this.snapshotContext);
        } else {
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
        }
        return this.frames;
    }

    /*
    * Method is used to clear all snapshots
    */
    public clear() {
        if (this.isPlaying()) { this.endPlay(null); }
        if (this.audioBlob) { this.audioBlob = null; }
        this.setAudioSrc(null);
        if (this.frames.length === 0) { return; }
        this.frames = [];
        this.frameWebps = [];
        this.snapshotContext.clearRect(0, 0, this.width, this.height);
        this.playContext.clearRect(0, 0, this.width, this.height);
        this.name = null;
    }

    public async toggleCamera(layoutOptions: LayoutOptions) {
        if (this.video.paused) {
            if (this.video.srcObject && this.video.srcObject.active) {
                this.isStreaming = true;
                try {
                    await this.video.play();
                    return true;
                } catch (err) {
                    return false;
                }
            } else {
                await this.attachStream(this.videoSourceId, layoutOptions);
                return true;
            }
        } else {
            this.video.pause();
            this.detachStream();
            this.isStreaming = false;
            return false;
        }
    }

    public rotateCamera() {
        this.rotated = !this.rotated;
    }

    public setFramerate(frameRate: number) {
        if (frameRate > 0) {
            this.frameRate.next(frameRate);
        }
    }

    public async togglePlay() {
        if (this.isPlaying()) {
            this.endPlay(null);
            return true;
        } else {
            await this.startPlay(null);
            return true;
        }
    }

    public clearAudio() {
        if (this.audioRecorder) { return; }
        this.isRecording = false;
        this.setAudioSrc(null);
    }

    startPlay(noAudio) {
        return new Promise((resolve, reject) => {
            if (!this.frames.length) {
                resolve(false);
                return;
            }
            this.snapshotCanvas.style.visibility = 'hidden';
            this.video.pause();
            this.drawFrame(0, this.playContext);
            this.zeroPlayTime = performance.now();
            this.playTimer = setTimeout(this.playFrame.bind(this), this.frameTimeout(), 1, resolve);
            if (this.audio && !noAudio) {
                this.audio.currentTime = 0;
                this.audio.play();
            }
            this.isAnimatorPlaying.next(true);
        });
    }

    endPlay(cb) {
        if (this.isPlaying()) { clearTimeout(this.playTimer); }
        this.playTimer = null;
        if (this.audioRecorder && this.audioRecorder.state === 'recording') {
            this.audioRecorder.stop();
        } else if (this.audio) {
            this.audio.pause();
        }
        this.playContext.clearRect(0, 0, this.width, this.height);
        this.snapshotCanvas.style.visibility = 'hidden';
        if (this.isStreaming) { this.video.play(); }
        this.isAnimatorPlaying.next(false);
        if (cb) { cb(); }
    }

    playFrame(frameNumber, cb) {
        if (frameNumber >= this.frames.length) {
            this.playTimer = setTimeout(this.endPlay.bind(this), 1000, cb);
        } else {
            this.drawFrame(frameNumber, this.playContext);
            const timeout = this.zeroPlayTime + ((frameNumber + 1) * this.frameTimeout()) - performance.now();
            this.playTimer = setTimeout(this.playFrame.bind(this), timeout, frameNumber + 1, cb);
        }
        // console.log('🚀 ~ file: animator.ts ~ line 245 ~ Animator ~ playFrame ~  this.playTimer', this.playTimer);
    }

    drawFrame(frameNumber, context) {
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(this.frames[frameNumber], 0, 0, this.width, this.height);
    }

    frameTimeout() {
        return 1000.0 / this.frameRate.getValue();
    }

    detachStream() {
        if (!this.video.srcObject) {
            return;
        }
        this.video.pause();
        this.video.srcObject.getVideoTracks()[0].stop();
        this.isStreaming = false;
        this.video.srcObject = null;
    }

    isPlaying() {
        return !!this.playTimer;
    }

    loadFinished() {
        if (this.frames.length) {
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
            this.snapshotContext.drawImage(this.frames[this.frames.length - 1], 0, 0, this.width, this.height);
            this.startPlay(null);
        }
    }

    setAudioSrc(blob) {
        this.audioBlob = blob;
        if (this.audio) {
            URL.revokeObjectURL(this.audio.src);
            this.audio = null;
        }
        if (blob) {
            this.audio = document.createElement('audio');
            this.audio.src = URL.createObjectURL(blob);
        }
    }

    public async save(filename) {
        filename = filename || 'StopMotion';
        if (!filename.endsWith('.webm')) { filename += '.webm'; }
        const frameRate = await this.getFramerate().pipe(first()).toPromise();
        const videoWriter = new WebMWriter({
            quality: 0.95,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
            fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
            fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)
            // You must supply one of:
            // frameDuration: null, // Duration of frames in milliseconds
            frameRate,     // Number of frames per second
            transparent: false,      // True if an alpha channel should be included in the video
            alphaQuality: undefined, // Allows you to set the quality level of the alpha channel separately.
            // If not specified this defaults to the same value as `quality`.
        });

        for (const frame of this.frames) {
            if (this.isSafari()) {
                const encoder = new WebPEncoder();
                const config = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    extra_info_type: 0
                };
                encoder.WebPEncodeConfig(config); //when you set the config you must it do for every WebPEncode... new
                const out = { output: '' };
                //w*4 desc: w = width, 3:RGB/BGR, 4:RGBA/BGRA
                const ctx = frame.getContext('2d').getImageData(0, 0, this.width, this.height);
                encoder.WebPEncodeRGBA(ctx.data, this.width, this.height, this.width * 4, 75, out);
                const base64URI = `data:image/webp;base64,${btoa(out.output)}`;
                videoWriter.addFrame(base64URI);
            } else {
                videoWriter.addFrame(frame);
            }
        }

        const blob = await videoWriter.complete();
        this.exported = blob;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = url;
        downloadLink.click();
        URL.revokeObjectURL(url);
        return blob;
    }

    public async recordAudio(stream) {
        // determine if os is iOS or browser is safari, if so use other codec to store audio
        const mimeType = this.isSafari() ? 'audio/mp4' : 'audio/webm;codecs=opus';
        // const mimeType = 'video/webm';
        return new Promise(((resolve, reject) => {
            if (!this.frames.length) {
                resolve(null);
                return;
            }
            const state = this.audioRecorder ? this.audioRecorder.state : 'inactive';
            if (state === 'recording') {
                resolve(null);
                return;
            }
            this.audioRecorder = new MediaRecorder(stream, { mimeType });
            this.audioRecorder.ondataavailable = (evt => {
                this.audioChunks.push(evt.data);
            }).bind(this);
            this.audioRecorder.onstop = (evt => {
                this.audioRecorder = null;
                this.setAudioSrc(new Blob(this.audioChunks, { type: mimeType }));
                this.audioChunks = [];
                resolve(this.audioBlob);
            }).bind(this);
            this.startPlay(true);
            this.audioRecorder.start();
        }));
    }

    /*
    * setDimensions method is used to set dimension width and height of components
    */
    public setDimensions(layoutOptions: LayoutOptions): void {
        this.width = layoutOptions.width;
        this.height = layoutOptions.height;
        this.video.width = this.width;
        this.video.height = this.height;
        this.snapshotCanvas.width = this.width;
        this.snapshotCanvas.height = this.height;
        this.playCanvas.width = this.width;
        this.playCanvas.height = this.height;
    }


    addFrameVP8(frameOffset, callback, blob, idx) {
        let blobURL = URL.createObjectURL(blob);
        const image = new Image(this.width, this.height);
        this.framesInFlight++;

        image.addEventListener('error', (error) => {
            if (image.getAttribute('triedvp8l')) {
                console.log(error);
                this.framesInFlight--;
                URL.revokeObjectURL(blobURL);
                image.src = null;
                if (this.framesInFlight === 0) { callback(); }
            } else {
                // image.setAttribute('triedvp8l', true);
                image.setAttribute('triedvp8l', 'true');
                URL.revokeObjectURL(blobURL);
                blob = webm.vp8tovp8l(blob);
                blobURL = URL.createObjectURL(blob);
                image.src = blobURL;
            }
        });
        // .bind(this));

        image.addEventListener('load', (evt: any) => {
            const newCanvas = document.createElement('canvas');
            newCanvas.width = this.width;
            newCanvas.height = this.height;
            newCanvas.getContext('2d', { alpha: false }).drawImage(evt.target, 0, 0, this.width, this.height);
            this.frames[frameOffset + idx] = newCanvas;
            this.frameWebps[frameOffset + idx] = new Promise((resolve, reject) => {
                resolve(blob);
            });
            this.framesInFlight--;
            URL.revokeObjectURL(blobURL);
            if (this.framesInFlight === 0) { callback(); }
        });
        // .bind(this));

        image.src = blobURL;
    }

    public async load(file: any): Promise<any> {
        const result = await this.readFile(file);
        try {
            await this.decodeFile(result);
            this.loadFinished();
            return;
        } catch (err) {
            console.log('🚀 ~ file: animator.ts ~ line 422 ~ Animator ~ load ~ err', err);
            return;
        }
    }

    private async decodeFile(fileBuffer: ArrayBuffer) {
        const animator = this;
        return new Promise((resolve) => {
            webm.decode(fileBuffer,
                // animator.setDimensions.bind(animator),
                (width: number, height: number) => {
                    this.setDimensions({
                        width: this.width,
                        height: this.height
                    } as any);
                },
                // frameRateCB,
                (frameRate: number) => {
                    console.log('🚀 ~ file: animator.ts ~ line 400 ~ Animator ~ load ~ frameRate', frameRate);
                    this.setFramerate(Math.round(frameRate));
                },
                animator.addFrameVP8.bind(animator, this.frames.length, resolve),
                animator.setAudioSrc.bind(animator));
        });
    }

    private async readFile(file: any): Promise<ArrayBuffer> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = (event: any) => resolve(event.target.result);
            reader.readAsArrayBuffer(file);
        });
    }

    /*
    * Method is used to determine wether browser has user agent safari or is used on ios
    */
    private isSafari(): boolean {
        return (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) || this.platform.is('ios');
    }
}
