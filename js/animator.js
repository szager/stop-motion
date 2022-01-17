/* -*- mode: javascript; js-indent-level: 2 -*- */

// Copyright 2022 Stefan Zager <szager@gmail.com>
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var animator = animator || {};

(() => {
  const STATE_IDLE = 0;
  const STATE_PLAY = 1;
  const STATE_RECORD = 2;

  class Animator {
    constructor(video, snapshotCanvas, playCanvas, messageDiv) {
      this.video = video;
      this.videoStream = null;
      this.snapshotCanvas = snapshotCanvas;
      this.snapshotContext = snapshotCanvas.getContext('2d');
      this.playCanvas = playCanvas;
      this.playContext = playCanvas.getContext('2d');
      this.playTimer = null;
      this._flip = false;
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
      this.zeroPlayTime = 0;
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

    flip() {
      this._flip = !this._flip;
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
      return !!this.playTimer;
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

    drawFrame(frameNumber, context) {
      context.clearRect(0, 0, this.w, this.h);
      context.drawImage(this.frames[frameNumber], 0, 0, this.w, this.h);
    }

    capture() {
      if (!this.streamOn)
        return;
      let imageCanvas = document.createElement('canvas');
      imageCanvas.width = this.w;
      imageCanvas.height = this.h;
      let context = imageCanvas.getContext('2d', { alpha: false });
      if (this._flip) {
        context.rotate(Math.PI);
        context.translate(-this.w, -this.h);
      }
      context.drawImage(this.video, 0, 0, this.w, this.h);
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
      if (this.frames.length)
        this.drawFrame(this.frames.length-1, this.snapshotContext);
      else
        this.snapshotContext.clearRect(0, 0, this.w, this.h);
    }

    frameTimeout() {
      return 1000.0 / this.playbackSpeed;
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
      });
    }

    endPlay(cb) {
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
      if (cb)
        cb();
    }

    playFrame(frameNumber, cb) {
      if (frameNumber >= this.frames.length) {
        this.playTimer = setTimeout(this.endPlay.bind(this), 1000, cb);
      } else {
        this.drawFrame(frameNumber, this.playContext);
        let timeout = this.zeroPlayTime + ((frameNumber + 1) * this.frameTimeout()) - performance.now();
        this.playTimer = setTimeout(this.playFrame.bind(this), timeout, frameNumber + 1, cb);
      }
    }

    togglePlay() {
      if (this.isPlaying())
        return new Promise((resolve, reject) => {
          this.endPlay();
          resolve(true);
        });
      else
        return this.startPlay();
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
      image.addEventListener("error", (evt => {
        if (evt.target.getAttribute('triedvp8l')) {
          console.log(evt);
          this.framesInFlight--;
          URL.revokeObjectURL(blobURL);
          image = null;
          if (this.framesInFlight === 0)
            this.loadFinished();
        } else {
          evt.target.setAttribute('triedvp8l', true);
          URL.revokeObjectURL(blobURL);
          blob = webm.vp8tovp8l(blob);
          blobURL = URL.createObjectURL(blob);
          evt.target.src = blobURL;
        }
      }).bind(this));
      image.addEventListener("load", (evt => {
        let newCanvas = document.createElement('canvas');
        newCanvas.width = this.w;
        newCanvas.height = this.h;
        newCanvas.getContext('2d', { alpha: false }).drawImage(evt.target, 0, 0, this.w, this.h);
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
          webm.encode(title, an.w, an.h, an.frameTimeout(), an.frameWebps, fr.result)
              .then(resolve);
        });
        fr.readAsArrayBuffer(an.audioBlob);
      });
      return promise;
    }

    load(file, finishCB, frameRateCB) {
      let an = this;
      let frameOffset = this.frames.length;
      let reader = new FileReader();
      reader.addEventListener("loadend", evt => {
        webm.decode(evt.target.result,
                    an.setDimensions.bind(an),
                    frameRateCB,
                    an.addFrameVP8.bind(an, frameOffset),
                    an.setAudioSrc.bind(an));
        an.name = file.name.substring(0, file.name.length - 5);
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
