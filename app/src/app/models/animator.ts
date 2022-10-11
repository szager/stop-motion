import { Injectable } from '@angular/core';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { Platform } from '@ionic/angular';
import { BaseService } from '@services/base/base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as WebMWriter from 'webm-writer';
import * as zip from '@zip.js/zip.js';
import { MimeTypes } from '@enums/mime-types.enum';
import { RecorderState } from '@enums/recorder-state.enum';
import { ImagesService } from '@services/images/images.service';
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const webm: any;
@Injectable({
    providedIn: 'root'
})
export class Animator {
    audio: HTMLAudioElement;
    audioBlob: any;
    audioChunks: any[];
    audioMimeType: string;
    audioRecorder: MediaRecorder;
    audioStream: MediaStream;
    rotated: boolean;
    frames: any[];
    framesInFlight: number;
    frameWebps: any[];
    height: number;
    isStreaming: boolean;
    isRecording: boolean;
    name: any;
    playCanvas: any;
    playContext: any;
    playTimer: any;
    snapshotCanvas: any;
    snapshotContext: any;
    video: any;
    videoSourceId: any;
    videoStream: MediaStream;
    width: any;
    zeroPlayTime: number;

    private isAnimatorPlaying: BehaviorSubject<boolean>;
    private frameRate: BehaviorSubject<number>;

    constructor(
        // TODO if possible get rid of injectable again
        public baseService: BaseService,
        private platform: Platform,
        private imagesService: ImagesService,
    ) {
        this.isAnimatorPlaying = new BehaviorSubject(false);
        this.frameRate = new BehaviorSubject(6.0);
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
    public async init(video: any, snapshotCanvas: any, playCanvas: any, layoutOptions: any, hasData?: boolean): Promise<void> {
        if (!hasData) {
            this.audio = null;
            this.audioBlob = null;
            this.audioChunks = [];
            // determine if os is iOS or browser is safari, if so use other codec to store audio
            this.audioMimeType = this.getAudioMimeType();
            this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.frames = [];
            this.framesInFlight = 0;
            this.frameWebps = [];
            this.isStreaming = true;
            this.name = null;
            this.playCanvas = playCanvas;
            this.playContext = playCanvas.getContext('2d');
            this.playTimer = null;
            this.rotated = false;
            this.snapshotCanvas = snapshotCanvas;
            this.snapshotContext = snapshotCanvas.getContext('2d');
            this.video = video;
            this.videoStream = null;
            this.zeroPlayTime = 0;
        }
        console.log('🚀 ~ file: animator.ts ~ line 334 ~ Animator ~ returnnewPromise ~ this.audioMimeType', this.audioMimeType);

        this.setDimensions(layoutOptions);
    }

    /*
    * Method is used to attach a media stream to the video component
    */
    public async attachStream(sourceId: any, layoutOptions: LayoutOptions, facingMode?: string): Promise<any> {
        // console.log('🚀 ~ file: animator.ts ~ line 92 ~ Animator ~ attachStream ~ layoutOptions', layoutOptions);
        const constraints = {
            audio: false,
            frameRate: 30,
            video: null
        };

        facingMode = facingMode ? facingMode : 'user';
        const aspectRatio = (layoutOptions.isPortrait) ? layoutOptions.height / layoutOptions.width
            : layoutOptions.width / layoutOptions.height;

        if (this.platform.is('ios') || this.platform.is('android')) {
            constraints.video = {
                // strange bug - width and height needs to be swaped
                width: this.platform.is('android') ? layoutOptions.height : layoutOptions.width,
                height: this.platform.is('android') ? layoutOptions.width : layoutOptions.height,
                aspectRatio,
                facingMode
            };
        } else {
            if (sourceId) {
                constraints.video = {
                    width: layoutOptions.width,
                    height: layoutOptions.height,
                    sourceId,
                    aspectRatio
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

        const promise = await new Promise(((resolve, reject) => {
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

    /*
   * Method is used to toggle camera
   */
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

    public async startPlay(noAudio: boolean) {
        if (!this.frames.length) {
            return;
        }
        this.snapshotCanvas.style.visibility = 'hidden';
        this.video.pause();
        this.drawFrame(0, this.playContext);
        this.zeroPlayTime = performance.now();
        this.playTimer = setTimeout(this.playFrame.bind(this), this.frameTimeout(), 1);
        await this.playAudio(noAudio);
        this.isAnimatorPlaying.next(true);
    }

    async playAudio(noAudio: boolean) {
        if (this.audio && !noAudio) {
            try {
                this.audio.currentTime = 0;
                await this.audio.play();
            } catch (error: any) {
                this.baseService.toastService.presentToast({
                    message: this.baseService.translate.instant('toast_animator_audio_play_error'),
                    color: 'danger',
                });
            }
        }
    }

    endPlay(cb) {
        if (this.isPlaying()) { clearTimeout(this.playTimer); }
        this.playTimer = null;
        if (this.audioRecorder && this.audioRecorder.state === RecorderState.recording) {
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

    /*
    * Method is used to detach current media stream in case of camera change or data is cleared by the user
    */
    public detachStream() {
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

    /*
    * recordAudio method is used to record audio using browser MediaRecorder API
    */
    public async recordAudio(): Promise<Blob> {
        if (!this.frames.length) {
            return;
        }
        const state = this.audioRecorder ? this.audioRecorder.state : RecorderState.inactive;
        if (state === RecorderState.recording) {
            return;
        }

        return new Promise((async (resolve, reject) => {
            this.audioRecorder = new MediaRecorder(this.audioStream, { mimeType: this.audioMimeType });
            this.audioRecorder.ondataavailable = ((event: any) => {
                console.log('🚀 ~ file: animator.ts ~ line 318 ~ Animator ~ returnnewPromise ~ event', event);
                this.audioChunks.push(event.data);
            });
            this.audioRecorder.onstop = ((evt: any) => {
                this.audioRecorder = null;
                const blob = new Blob(this.audioChunks, { type: this.audioMimeType });
                this.audioChunks = [];
                resolve(blob);
            });
            // pass true to do not play audio at the same time
            this.startPlay(true);
            this.audioRecorder.start();
        }));
    }

    /*
    * setDimensions method is used to set dimension width and height of components
    */
    public setDimensions(layoutOptions: LayoutOptions): void {
        // console.log('🚀 ~ file: animator.ts ~ line 403 ~ Animator ~ setDimensions ~ layoutOptions', layoutOptions);
        this.width = layoutOptions.width;
        this.height = layoutOptions.height;
        this.video.width = this.width;
        this.video.height = this.height;
        this.snapshotCanvas.width = this.width;
        this.snapshotCanvas.height = this.height;
        this.playCanvas.width = this.width;
        this.playCanvas.height = this.height;
    }

    /*
   * Method is used to trigger file loading process
   */
    public async load(file: any): Promise<any> {
        const result = await this.readFile(file);
        console.log('🚀 ~ file: animator.ts ~ line 359 ~ Animator ~ load ~ result', result);
        try {
            await this.decodeFile(await new Response(result[0]).arrayBuffer());
            console.log('after decode');
            if (result[1]) {
                console.log('🚀 ~ file: animator.ts ~ line 363 ~ Animator ~ load ~ result[1]', result[1]);
                this.setAudioSrc(result[1], MimeTypes.audioMp3);
            }
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
            this.snapshotContext.drawImage(this.frames[this.frames.length - 1], 0, 0, this.width, this.height);
            return;
        } catch (err) {
            console.log('🚀 ~ file: animator.ts ~ line 370 ~ Animator ~ load ~ err', err);
            return;
        }
    }

    /*
    * Method is used to trigger file saving as draft process
    */
    public async saveDraft(filename: string) {
        const videoBlob = await this.createVideoBlob();
        const audioBlob = (this.audio) ? this.audioBlob : null;
        console.log('🚀 ~ file: animator.ts ~ line 378 ~ Animator ~ save ~ audioBlob', audioBlob);
        const dataURI = await this.createZipFile(videoBlob, audioBlob);
        saveAs(dataURI, filename + '.zip', { autoBom: true });
        URL.revokeObjectURL(dataURI);
        return;
    }

    /*
    * Method is used to set audio source from blob
    */
    public setAudioSrc(blob: Blob, mimeType?: MimeTypes) {
        console.log('🚀 ~ file: animator.ts ~ line 513 ~ Animator ~ setAudioSrc ~ blob', blob, mimeType);
        this.audioBlob = blob;
        if (this.audio) {
            URL.revokeObjectURL(this.audio.src);
            this.audio = null;
        }
        if (blob) {
            this.audio = document.createElement('audio');
            const sourceElement = document.createElement('source');
            this.audio.appendChild(sourceElement);
            sourceElement.src = URL.createObjectURL(blob);
            console.log('🚀 ~ file: animator.ts ~ line 527 ~ Animator ~ setAudioSrc ~ URL.createObjectURL(blob)', URL.createObjectURL(blob));
            sourceElement.type = (mimeType) ? mimeType : this.getAudioMimeType();
            this.audio.load();
        }
    }

    /*
    * Method is used to play single frame and apply timeout for next frame and update playTimer
    */
    private playFrame(frameNumber: number, cb: () => void) {
        console.log('🚀 ~ file: animator.ts ~ line 382 ~ Animator ~ playFrame ~ frameNumber', frameNumber, this.frames.length);
        if (frameNumber >= this.frames.length) {
            // this.playTimer = setTimeout(this.endPlay.bind(this), 1000, cb);
            this.endPlay(cb);
        } else {
            this.drawFrame(frameNumber, this.playContext);
            const timeout = this.zeroPlayTime + ((frameNumber + 1) * this.frameTimeout()) - performance.now();
            this.playTimer = setTimeout(this.playFrame.bind(this), timeout, frameNumber + 1, cb);
        }
    }

    /*
   * Method is used to clear canvas and draw current frame
   */
    private drawFrame(frameNumber, context) {
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(this.frames[frameNumber], 0, 0, this.width, this.height);
    }

    /*
    * Method is used to create video blob
    * Depending on platform differnt types of enconding are used
    */
    private async createVideoBlob(): Promise<Blob> {
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

        if (this.isSafari()) {
            for (const frame of this.frameWebps) {
                const image = await this.imagesService.convertImages(frame);
                videoWriter.addFrame(this.uint8ToBase64(image));
            }
        } else {
            for (const frame of this.frames) {
                videoWriter.addFrame(frame);
            }
        }

        const blob = await videoWriter.complete();
        return blob;
    }

    /*
    * Method is used to create zip file of video and audio (if available)
    */
    private async createZipFile(videoBlob: Blob, audioBlob: Blob): Promise<string> {
        zip.configure({ useWebWorkers: false });
        const zipWriter = new zip.ZipWriter(new zip.Data64URIWriter('application/zip'));
        await zipWriter.add('video.webm', new zip.BlobReader(videoBlob));
        if (audioBlob) {
            await zipWriter.add('audio.webm', new zip.BlobReader(audioBlob));
        }
        const dataURI = await zipWriter.close();
        return dataURI;
    }

    /*
    * Method is used to decode array buffer to single frames, export framerate
    */
    private async decodeFile(fileBuffer: ArrayBuffer) {
        const animator = this;
        const result = await new Promise((resolve) => {
            webm.decode(fileBuffer,
                (width: number, height: number) => {
                    this.setDimensions({
                        width: this.width,
                        height: this.height
                    } as any);
                },
                (frameRate: number) => {
                    this.setFramerate(Math.round(frameRate));
                },
                animator.addFrameVP8.bind(animator, this.frames.length, resolve),
                animator.setAudioSrc.bind(animator));
        });
        console.log('🚀 ~ file: animator.ts ~ line 507 ~ Animator ~ result ~ result', result);
        return result;
    }

    /*
    * Method is used to read entire zip file
    */
    private async readFile(file: any): Promise<Blob[]> {
        const reader = new zip.ZipReader(new zip.BlobReader(file));
        const entries = await reader.getEntries();
        const blobs = [];
        await Promise.all(entries.map(async (entry: any, index: number) => {
            console.log('🚀 ~ file: animator.ts ~ line 496 ~ Animator ~ awaitPromise.all ~ entry', entry);
            const blob = await this.readFileEntry(entry, index);
            console.log('🚀 ~ file: animator.ts ~ line 498 ~ Animator ~ awaitPromise.all ~ blob', blob);
            blobs.push(blob);
        }));
        await reader.close();
        if (blobs.length > 1 && blobs[0].type !== MimeTypes.video) {
            // swap array elements if audio is first
            blobs.unshift(blobs.pop());
        }
        console.log('🚀 ~ file: animator.ts ~ line 505 ~ Animator ~ readFile ~ blobs', blobs);
        console.log('🚀 ~ file: animator.ts ~ line 531 ~ Animator ~ readFile ~ this.frameWebps', this.frameWebps);
        console.log('🚀 ~ file: animator.ts ~ line 531 ~ Animator ~ readFile ~ this.frames', this.frames);
        return blobs;
    }

    /*
    * Method is used to read file inside of zip file
    */
    private async readFileEntry(entry: any, index: number): Promise<Blob> {
        const type = (index === 0) ? MimeTypes.video : MimeTypes.audioMp3;
        return await entry.getData(new zip.BlobWriter(type));
    }

    /*
    * Method is used to determine wether browser has user agent safari or is used on ios
    */
    private isSafari(): boolean {
        return (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) || this.platform.is('ios');
    }

    /*
    * Method is used to get proper audio mime type
    */
    private getAudioMimeType(): string {
        return this.isSafari() ? MimeTypes.audioMp4 : MimeTypes.audioWebm;
    }

    /*
    * Method is used to add single frames from files after it is loaded
    */
    private addFrameVP8(frameOffset: number, callback: any, blob: Blob, index: number) {
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

        image.addEventListener('load', async (evt: any) => {
            const newCanvas = document.createElement('canvas');
            newCanvas.width = this.width;
            newCanvas.height = this.height;
            newCanvas.getContext('2d', { alpha: false }).drawImage(evt.target, 0, 0, this.width, this.height);
            this.frames[frameOffset + index] = newCanvas;
            this.frameWebps[frameOffset + index] = await new Promise((resolve, reject) => {
                resolve(blob);
            });
            this.framesInFlight--;
            URL.revokeObjectURL(blobURL);
            if (this.framesInFlight === 0) { callback(); }
        });

        image.src = blobURL;
    }

    /*
    * Method is used to calculate timeout between frames
    */
    private frameTimeout() {
        return 1000.0 / this.frameRate.getValue();
    }

    /*
    * Method is used to convert ArrayBuffer to base64 string
    */
    private uint8ToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return `data:image/webp;base64,${window.btoa(binary)}`;
    }
}

