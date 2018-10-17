/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var animator = animator || {};

(function() {
  animator.Animator = function(video, snapshotCanvas, playCanvas, messageDiv) {
    this.video = video;
    this.videoStream = null;
    this.snapshotCanvas = snapshotCanvas;
    this.snapshotContext = snapshotCanvas.getContext('2d');
    this.playCanvas = playCanvas;
    this.playContext = playCanvas.getContext('2d');
    this.messageDiv = messageDiv;
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
  };

  animator.Animator.prototype.videoCannotPlayHandler = function(e) {
    console.log('navigator.getUserMedia error: ', e);
    this.messageDiv.innerHTML = "Cannot connect to camera.";
  };

  animator.Animator.prototype.setDimensions = function(w, h) {
    this.w = w;
    this.h = h;
    this.video.width = w;
    this.video.height = h;
    this.snapshotCanvas.width = this.w;
    this.snapshotCanvas.height = this.h;
  };

  animator.Animator.prototype.attachStream = function(sourceId) {
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
    navigator.getUserMedia(
      constraints,
      function(stream) {
        this.video.srcObject = stream;
        this.videoStream = stream;
        this.streamOn = true;
      }.bind(this),
      this.videoCannotPlayHandler.bind(this)
    );
  };

  animator.Animator.prototype.detachStream = function () {
    if (!this.video.srcObject)
      return;
    this.video.pause();
    this.video.srcObject.getVideoTracks()[0].stop();
    this.streamOn = false;
    this.video.srcObject = null;
  };

  animator.Animator.prototype.isPlaying = function() {
    return Boolean(this.playTimer);
  };

  animator.Animator.prototype.toggleVideo = function() {
    if (this.video.paused) {
      if (this.video.srcObject.active) {
        this.video.play();
        this.streamOn = true;
      } else {
        this.attachStream(this.videoSourceId);
      }
    } else {
      this.video.pause();
      this.streamOn = false;
    }
  };

  animator.Animator.prototype.capture = function() {
    if (!this.streamOn)
      return;
    let imageCanvas = document.createElement('canvas');
    imageCanvas.width = this.w;
    imageCanvas.height = this.h;
    imageCanvas.getContext('2d').drawImage(this.video, 0, 0, this.w, this.h);
    this.frames.push(imageCanvas);
    let promise = new Promise(function(resolve, reject) {
      imageCanvas.toBlob(function(blob) { resolve(blob) }, 'image/webp');
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.snapshotContext.drawImage(imageCanvas, 0, 0, this.w, this.h);
    }.bind(this));
    this.frameWebps.push(promise);
  };

  animator.Animator.prototype.undoCapture = function() {
    this.frames.pop();
    this.frameWebps.pop();
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length)
      this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0);
  };

  animator.Animator.prototype.frameTimeout = function() {
    return 1000.0 / 24;
  };

  animator.Animator.prototype.startPlay = function(noAudio) {
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
  };

  animator.Animator.prototype.endPlay = function() {
    if (this.isPlaying())
      clearTimeout(this.playTimer);
    this.playTimer = null;
    if (this.audioRecorder && this.audioRecorder.state == "recording")
      setTimeout(this.audioRecorder.stop, this.frameTimeout());
    if (this.audio)
      this.audio.pause();
    this.playContext.clearRect(0, 0, this.w, this.h);
    this.snapshotCanvas.style.visibility = '';
    if (this.streamOn)
      this.video.play();
  };

  animator.Animator.prototype.drawFrame = function(frameNumber, context) {
    context.clearRect(0, 0, this.w, this.h);
    context.drawImage(this.frames[frameNumber], 0, 0);
  };

  animator.Animator.prototype.playFrame = function(frameNumber) {
    if (frameNumber >= this.frames.length) {
      if (this.audioRecorder && this.audioRecorder.state == "recording")
        this.audioRecorder.stop();
      this.playTimer = setTimeout(this.endPlay.bind(this), 1000);
      return;
    }
    this.drawFrame(frameNumber++, this.playContext);
    this.playTimer = setTimeout(this.playFrame.bind(this, frameNumber), this.frameTimeout());
  };

  animator.Animator.prototype.togglePlay = function() {
    if (this.isPlaying())
      this.endPlay();
    else
      this.startPlay();
  };

  animator.Animator.prototype.clear = function() {
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
  };

  animator.Animator.prototype.getFramePNG = function(idx) {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.drawImage(this.frames[idx], 0, 0);
    let dataUrl = this.snapshotCanvas.toDataURL();
    let binStr = atob(dataUrl.split(',')[1]);
    let arr = new Uint8Array(binStr.length - 8);
    for (let i = 8; i < binStr.length; i++)
      arr[i-8] = binStr.charCodeAt(i);
    return arr;
  };

  animator.Animator.prototype.loadFinished = function() {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length) {
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0, this.w, this.h);
      this.startPlay();
    }
  };

  animator.Animator.prototype.addFrameVP8 = function(frameOffset, blob, idx) {
    let this_animator = this;
    let blobURL = URL.createObjectURL(blob);
    let image = new Image(this.w, this.h);
    this.framesInFlight++;
    image.src = blobURL;
    image.onerror = function(e) {
      if (image.triedvp8l) {
        console.log(e.type);
        this_animator.framesInFlight--;
        return;
      }
      image.triedvp8l = true;
      URL.revokeObjectURL(blobURL);
      blob = webm.vp8tovp8l(blob);
      blobURL = URL.createObjectURL(blob);
      image.src = blobURL;
    };
    image.onload = function() {
      let newCanvas = document.createElement('canvas');
      newCanvas.width = this_animator.w;
      newCanvas.height = this_animator.h;
      newCanvas.getContext('2d').drawImage(this, 0, 0, this_animator.w, this_animator.h);
      this_animator.frames[frameOffset + idx] = newCanvas;
      this_animator.frameWebps[frameOffset + idx] = new Promise(function(resolve, reject) { resolve(blob); });
      this_animator.framesInFlight--;
      URL.revokeObjectURL(blobURL);
      if (this_animator.framesInFlight === 0)
        this_animator.loadFinished();
    };
  };

  animator.Animator.prototype.setAudioSrc = function(blob) {
    this.audioBlob = blob;
    if (this.audio) {
      URL.revokeObjectURL(this.audio.src);
      this.audio = null;
    }
    if (blob) {
      this.audio = document.createElement('audio');
      this.audio.src = URL.createObjectURL(blob);
    }
  };

  animator.Animator.prototype.save = function(filename) {
    filename = filename || 'StopMotion';
    if (!filename.endsWith('.webm'))
      filename += '.webm';
    let title = filename.substr(0, filename.length - 5);
    return this.encode(title).then(function(blob) {
      this.exported = blob;
      let url = URL.createObjectURL(blob);
      let downloadLink = document.createElement('a');
      downloadLink.download = filename;
      downloadLink.href = url;
      downloadLink.click();
      URL.revokeObjectURL(url);
      return blob;
    }.bind(this));
  };

  animator.Animator.prototype.encode = function(title) {
    if (!this.audioBlob)
      return webm.encode(title, this.w, this.h, this.frameTimeout(), this.frameWebps, null);
    let fr = new FileReader();
    let an = this;
    let promise = new Promise(function(resolve, reject) {
      fr.addEventListener("loadend", function() {
        webm.encode(title, an.w, an.h, an.frameTimeout(), an.frameWebps, this.result)
            .then(function(blob) { resolve(blob) });
      });
      fr.readAsArrayBuffer(an.audioBlob);
    });
    return promise;
  };

  animator.Animator.prototype.load = function(file, finishCB, frameRateCB) {
    let animator = this;
    let frameOffset = this.frames.length;
    let reader = new FileReader();
    reader.onloadend = function() {
      webm.decode(this.result,
                  animator.setDimensions.bind(animator),
                  frameRateCB,
                  animator.addFrameVP8.bind(animator, frameOffset),
                  animator.setAudioSrc.bind(animator));
      animator.name = file.name.substring(0, file.name.length - 5);
      if (finishCB)
        finishCB();
    };
    reader.readAsArrayBuffer(file);
  };

  animator.Animator.prototype.recordAudio = function(stream) {
    let promise = new Promise(function(resolve, reject) {
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
      this.audioRecorder.ondataavailable = function(evt) {
        this.audioChunks.push(evt.data);
      }.bind(this);
      this.audioRecorder.onstop = function(evt) {
        this.audioRecorder = null;
        this.setAudioSrc(new Blob(this.audioChunks, {'type': 'audio/webm;codecs=opus'}));
        this.audioChunks = [];
        resolve(this.audioBlob);
      }.bind(this);
      this.startPlay(true);
      this.audioRecorder.start();
    }.bind(this));
    return promise;
  };

  animator.Animator.prototype.clearAudio = function() {
    if (this.audioRecorder)
      return;
    this.setAudioSrc(null);
  };
})();
