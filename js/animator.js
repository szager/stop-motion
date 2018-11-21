/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var animator = animator || {};

(() => {
  class Animator {
    constructor(video, snapshotCanvas, playCanvas, messageDiv) {
      this.video = video;
      this.videoStream = null;
      this.snapshotCanvas = snapshotCanvas;
      this.snapshotContext = snapshotCanvas.getContext('2d');
      this.playCanvas = playCanvas;
      this.playContext = playCanvas.getContext('2d');
      this.messageDiv = messageDiv;
      this.playbackSpeed = 24.0;
      this.frames = [];
      this.frameWebps = [];
      this.streamOn = true;
      this.name = null;
      this.framesInFlight = 0;
      this.loadFinishPending = false;
      this.audio = null;
      this.audioRecorder = null;
      this.audioChunks = [];
      this.audioBlob = null;
      this.setDimensions(snapshotCanvas.width, snapshotCanvas.height);
    }

    setPlaybackSpeed(speed) {
      if (speed > 0)
        this.playbackSpeed = speed;
    }

    videoCannotPlayHandler(e) {
      console.log('navigator.mediaDevices.getUserMedia error: ', e);
      this.messageDiv.innerText = "Cannot connect to camera.";
      return false;
    }

    setDimensions(w, h) {
      this.w = w;
      this.h = h;
      this.video.width = w;
      this.video.height = h;
      this.snapshotCanvas.width = this.w;
      this.snapshotCanvas.height = this.h;
    }

    attachStream(sourceId) {
      this.messageDiv.innerText = "";
      let constraints = {
        audio: false,
        frameRate: 15,
        width: 640,
        height: 480
      };
      this.videoSourceId = sourceId;
      if (sourceId) {
        constraints.video = {
          optional: [{
            sourceId: sourceId
          }]
        };
      } else {
        constraints.video = true;
      }
      return navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        this.video.srcObject = stream;
        this.videoStream = stream;
        this.streamOn = true;
        return stream;
      }).catch(this.videoCannotPlayHandler.bind(this));
    }

    detachStream() {
      if (!this.video.srcObject)
        return;
      this.video.pause();
      this.video.srcObject.getVideoTracks()[0].stop();
      this.streamOn = false;
      this.video.srcObject = null;
    }

    isPlaying() {
      return Boolean(this.playTimer);
    }

    toggleVideo() {
      if (this.video.paused) {
        if (this.video.srcObject && this.video.srcObject.active) {
          this.streamOn = true;
          return this.video.play()
              .then(() => { return true; })
              .catch(() => { return false; });
        } else {
          return this.attachStream(this.videoSourceId);
        }
      } else {
        this.video.pause();
        this.detachStream();
        this.streamOn = false;
        return new Promise((resolve, reject) => { resolve(false) });
      }
    }

    capture() {
      if (!this.streamOn)
        return;
      let imageCanvas = document.createElement('canvas');
      imageCanvas.width = this.w;
      imageCanvas.height = this.h;
      imageCanvas.getContext('2d').drawImage(this.video, 0, 0, this.w, this.h);
      this.frames.push(imageCanvas);
      let promise = new Promise(((resolve, reject) => {
        if (self.requestIdleCallback) {
          requestIdleCallback(() => {
            imageCanvas.toBlob(blob => { resolve(blob) }, 'image/webp');
          });
        } else {
          imageCanvas.toBlob(blob => { resolve(blob) }, 'image/webp');
        }
        this.snapshotContext.clearRect(0, 0, this.w, this.h);
        this.snapshotContext.drawImage(imageCanvas, 0, 0, this.w, this.h);
      }).bind(this));
      this.frameWebps.push(promise);
    }

    undoCapture() {
      this.frames.pop();
      this.frameWebps.pop();
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      if (this.frames.length)
        this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0);
    }

    frameTimeout() {
      return 1000.0 / this.playbackSpeed;
    }

    startPlay(noAudio) {
      if (!this.frames.length)
        return;
      this.snapshotCanvas.style.visibility = 'hidden';
      this.video.pause();
      this.drawFrame(0, this.playContext);
      this.playTimer = setTimeout(this.playFrame.bind(this, 1), this.frameTimeout());
      if (this.audio && !noAudio) {
        this.audio.currentTime = 0;
        this.audio.play();
      }
    }

    endPlay() {
      if (this.isPlaying())
        clearTimeout(this.playTimer);
      this.playTimer = null;
      if (this.audioRecorder && this.audioRecorder.state == "recording") {
        this.audioRecorder.stop();
      } else if (this.audio) {
        this.audio.pause();
      }
      this.playContext.clearRect(0, 0, this.w, this.h);
      this.snapshotCanvas.style.visibility = '';
      if (this.streamOn)
        this.video.play();
    }

    drawFrame(frameNumber, context) {
      context.clearRect(0, 0, this.w, this.h);
      context.drawImage(this.frames[frameNumber], 0, 0);
    }

    playFrame(frameNumber) {
      if (frameNumber >= this.frames.length) {
        this.playTimer = setTimeout(this.endPlay.bind(this), 1000);
      } else {
        this.drawFrame(frameNumber++, this.playContext);
        this.playTimer = setTimeout(this.playFrame.bind(this, frameNumber),
                                      this.frameTimeout());
      }
    }

    togglePlay() {
      if (this.isPlaying())
        this.endPlay();
      else
        this.startPlay();
    }

    clear() {
      if (this.isPlaying())
        this.endPlay();
      if (this.audioBlob)
        this.audioBlob = null;
      this.setAudioSrc(null);
      if (this.frames.length === 0)
        return;
      this.frames = [];
      this.frameWebps = [];
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.playContext.clearRect(0, 0, this.w, this.h);
      this.name = null;
    }

    getFramePNG(idx) {
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.snapshotContext.drawImage(this.frames[idx], 0, 0);
      let dataUrl = this.snapshotCanvas.toDataURL();
      let binStr = atob(dataUrl.split(',')[1]);
      let arr = new Uint8Array(binStr.length - 8);
      for (let i = 8; i < binStr.length; i++)
        arr[i-8] = binStr.charCodeAt(i);
      return arr;
    }

    loadFinished() {
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      if (this.frames.length) {
        this.snapshotContext.clearRect(0, 0, this.w, this.h);
        this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0, this.w, this.h);
        this.startPlay();
      }
    }

    addFrameVP8(frameOffset, blob, idx) {
      let blobURL = URL.createObjectURL(blob);
      let image = new Image(this.w, this.h);
      this.framesInFlight++;
      image.addEventListener("error", (error => {
        if (image.getAttribute('triedvp8l')) {
          console.log(error);
            this.framesInFlight--;
            URL.revokeObjectURL(blobURL);
            image.src = null;
            if (this.framesInFlight === 0)
            this.loadFinished();
        } else {
          image.setAttribute('triedvp8l', true);
            URL.revokeObjectURL(blobURL);
          blob = webm.vp8tovp8l(blob);
          blobURL = URL.createObjectURL(blob);
          image.src = blobURL;
        }
      }).bind(this));
      image.addEventListener("load", (evt => {
        let newCanvas = document.createElement('canvas');
        newCanvas.width = this.w;
        newCanvas.height = this.h;
        newCanvas.getContext('2d').drawImage(evt.target, 0, 0, this.w, this.h);
        this.frames[frameOffset + idx] = newCanvas;
        this.frameWebps[frameOffset + idx] = new Promise((resolve, reject) => {
            resolve(blob);
        });
        this.framesInFlight--;
        URL.revokeObjectURL(blobURL);
        if (this.framesInFlight === 0)
          this.loadFinished();
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

    save(filename) {
      filename = filename || 'StopMotion';
      if (!filename.endsWith('.webm'))
        filename += '.webm';
      let title = filename.substr(0, filename.length - 5);
      return this.encode(title).then((blob => {
        this.exported = blob;
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = url;
        downloadLink.click();
        URL.revokeObjectURL(url);
        return blob;
      }).bind(this));
    }

    encode(title) {
      if (!this.audioBlob)
        return webm.encode(title, this.w, this.h, this.frameTimeout(), this.frameWebps, null);
      let fr = new FileReader();
      let an = this;
      let promise = new Promise((resolve, reject) => {
        fr.addEventListener("loadend", evt => {
          webm.encode(title, an.w, an.h, an.frameTimeout(), an.frameWebps, this.result)
              .then(resolve);
        });
        fr.readAsArrayBuffer(an.audioBlob);
      });
      return promise;
    }

    load(file, finishCB, frameRateCB) {
      let animator = this;
      let frameOffset = this.frames.length;
      let reader = new FileReader();
      reader.addEventListener("loadend", evt => {
        webm.decode(evt.target.result,
                    animator.setDimensions.bind(animator),
                    frameRateCB,
                    animator.addFrameVP8.bind(animator, frameOffset),
                    animator.setAudioSrc.bind(animator));
        animator.name = file.name.substring(0, file.name.length - 5);
        if (finishCB)
          finishCB();
      });
      reader.readAsArrayBuffer(file);
    }

    recordAudio(stream) {
      let promise = new Promise(((resolve, reject) => {
        if (!this.frames.length) {
          resolve(null);
          return;
        }
        let state = this.audioRecorder ? this.audioRecorder.state : "inactive";
        if (state == "recording") {
          resolve(null);
          return;
        }
        this.audioRecorder = new MediaRecorder(stream, {mimeType: "audio/webm;codecs=opus"});
        this.audioRecorder.ondataavailable = (evt => {
          this.audioChunks.push(evt.data);
        }).bind(this);
        this.audioRecorder.onstop = (evt => {
          this.audioRecorder = null;
          this.setAudioSrc(new Blob(this.audioChunks, {'type': 'audio/webm;codecs=opus'}));
          this.audioChunks = [];
          resolve(this.audioBlob);
        }).bind(this);
        this.startPlay(true);
        this.audioRecorder.start();
      }).bind(this));
      return promise;
    }

    clearAudio() {
      if (this.audioRecorder)
        return;
      this.setAudioSrc(null);
    }
  }

  animator.Animator = Animator;
})();
