import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BaseService } from '@services/base/base.service';
import { BehaviorSubject, Observable } from 'rxjs';

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
    playbackSpeed: number;
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

    constructor(
        // TODO if possibole get rid of injectable again
        public baseService: BaseService,
        private platform: Platform
    ) {
        this.isAnimatorPlaying = new BehaviorSubject(false);
    }

    getIsPlaying(): Observable<any> {
        return this.isAnimatorPlaying.asObservable();
    }

    /*
    * Init method is used to initialize properties
    */
    public init(video, snapshotCanvas, playCanvas, messageDiv): void {
        this.audio = null;
        this.audioBlob = null;
        this.audioChunks = [];
        this.audioRecorder = null;
        this.frames = [];
        this.framesInFlight = 0;
        this.frameWebps = [];
        this.isStreaming = true;
        this.loadFinishPending = false;
        this.messageDiv = messageDiv;
        this.name = null;
        this.playbackSpeed = 12.0;
        this.playCanvas = playCanvas;
        this.playContext = playCanvas.getContext('2d');
        this.playTimer = null;
        this.rotated = false;
        this.snapshotCanvas = snapshotCanvas;
        this.snapshotContext = snapshotCanvas.getContext('2d');
        this.video = video;
        this.videoStream = null;
        this.zeroPlayTime = 0;

        this.setDimensions(snapshotCanvas.width, snapshotCanvas.height);
    }

    /*
    * Method is used to attach a media stream to the video component
    */
    public async attachStream(sourceId): Promise<any> {
        const constraints = {
            audio: false,
            frameRate: 15,
            width: 640,
            height: 480,
            video: null
        };
        this.videoSourceId = sourceId;
        if (sourceId) {
            constraints.video = {
                optional: [{
                    sourceId
                }]
            };
        } else {
            constraints.video = true;
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

        this.snapshotCanvas.style.visibility = 'visible';
        setTimeout (() => {
            this.snapshotCanvas.style.visibility = 'hidden';
         }, 600);

        const promise = new Promise(((resolve, reject) => {
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
            this.snapshotContext.drawImage(imageCanvas, 0, 0, this.width, this.height);
            // if (this.requestIdleCallback) {
            //     requestIdleCallback(() => {
            //         imageCanvas.toBlob(blob => { resolve(blob); }, 'image/webp');
            //     });
            // } else {
            imageCanvas.toBlob(blob => { resolve(blob); }, 'image/webp');
            // }
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

    public async toggleCamera() {
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
                await this.attachStream(this.videoSourceId);
                return true;
            }
        } else {
            this.video.pause();
            this.detachStream();
            this.isStreaming = false;
            return false;
        }
    }

    public rotateCapture() {
        this.rotated = !this.rotated;
    }

    public setPlaybackSpeed(speed: number) {
        if (speed > 0) {
            this.playbackSpeed = speed;
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
        return 1000.0 / this.playbackSpeed;
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
        this.snapshotContext.clearRect(0, 0, this.width, this.height);
        if (this.frames.length) {
            this.snapshotContext.clearRect(0, 0, this.width, this.height);
            this.snapshotContext.drawImage(this.frames[this.frames.length - 1], 0, 0, this.width, this.height);
            this.startPlay(null);
        }
    }

    addFrameVP8(frameOffset, blob, idx) {
        let blobURL = URL.createObjectURL(blob);
        const image = new Image(this.width, this.height);
        this.framesInFlight++;
        image.addEventListener('error', (error => {
            if (image.getAttribute('triedvp8l')) {
                console.log(error);
                this.framesInFlight--;
                URL.revokeObjectURL(blobURL);
                image.src = null;
                if (this.framesInFlight === 0) { this.loadFinished(); }
            } else {
                // image.setAttribute('triedvp8l', true);
                image.setAttribute('triedvp8l', 'true');
                URL.revokeObjectURL(blobURL);
                blob = webm.vp8tovp8l(blob);
                blobURL = URL.createObjectURL(blob);
                image.src = blobURL;
            }
        }).bind(this));
        image.addEventListener('load', (evt => {
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
            if (this.framesInFlight === 0) { this.loadFinished(); }
        }).bind(this));
        image.src = blobURL;
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

    async save(filename) {
        filename = filename || 'StopMotion';
        if (!filename.endsWith('.webm')) { filename += '.webm'; }
        const title = filename.substr(0, filename.length - 5);
        const blob = await this.encode(title);
        this.exported = blob;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = url;
        downloadLink.click();
        URL.revokeObjectURL(url);
        return blob;

        // return this.encode(title).then((blob => {
        //     this.exported = blob;
        //     const url = URL.createObjectURL(blob);
        //     const downloadLink = document.createElement('a');
        //     downloadLink.download = filename;
        //     downloadLink.href = url;
        //     downloadLink.click();
        //     URL.revokeObjectURL(url);
        //     return blob;
        // }).bind(this));
    }

    encode(title): Promise<any> {
        if (!this.audioBlob) {
            console.log('🚀 ~ file: line 358 ~ encode ~ title', title, this.width, this.height, this.frameTimeout(), this.frameWebps);
            return webm.encode(title, this.width, this.height, this.frameTimeout(), this.frameWebps, null);
        }
        const fr = new FileReader();
        const an = this;
        console.log('🚀 ~ file: animator.ts ~ line 361 ~ Animator ~ encode ~ an', an.width, an.height, an.frameTimeout(), an.frameWebps);
        const promise = new Promise((resolve, reject) => {
            fr.addEventListener('loadend', evt => {
                console.log('🚀 ~ file: animator.ts ~ line 364 ~ Animator ~ promise ~ loadend', fr.result);
                webm.encode(title, an.width, an.height, an.frameTimeout(), an.frameWebps, fr.result)
                    .then(resolve);
            });
            fr.readAsArrayBuffer(an.audioBlob);
        });
        return promise;
    }

    public async load(file: any): Promise<any> {
        const animator = this;
        const frameOffset = this.frames.length;
        const reader = new FileReader();
        reader.addEventListener('loadend', evt => {
            webm.decode(evt.target.result,
                animator.setDimensions.bind(animator),
                // frameRateCB,
                (frameRate) => {
                console.log('🚀 ~ file: animator.ts ~ line 400 ~ Animator ~ load ~ frameRate', frameRate);
                },
                animator.addFrameVP8.bind(animator, frameOffset),
                animator.setAudioSrc.bind(animator));
            animator.name = file.name.substring(0, file.name.length - 5);
            // if (finishCB) { finishCB(); }
            return;
        });
        reader.readAsArrayBuffer(file);
    }

    public async recordAudio(stream) {
        const mimeType = this.platform.is('ios') ? 'audio/mp4' : 'audio/webm;codecs=opus';
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
    private setDimensions(width: number, heigth: number): void {
        this.width = width;
        this.height = heigth;
        this.video.width = width;
        this.video.height = heigth;
        this.snapshotCanvas.width = this.width;
        this.snapshotCanvas.height = this.height;
    }
}
