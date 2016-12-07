/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var animator = animator || {};

(function() {
  var an = animator;

  an.Animator = function(video, streamCanvas, snapshotCanvas) {
    this.video = video;
    this.streamCanvas = streamCanvas;
    this.streamContext = streamCanvas.getContext('2d');
    this.snapshotCanvas = snapshotCanvas;
    this.snapshotContext = snapshotCanvas.getContext('2d');
    this.frames = [];
    this.streamOn = true;
    this.name = null;
    this.saved = false;
    this.framesInFlight = 0;
    this.loadFinishPending = false;
  };

  an.Animator.prototype.videoCannotPlayHandler = function(e) {
    console.log('navigator.getUserMedia error: ', e);
    this.streamContext.font = "36px " + getComputedStyle(this.streamCanvas).fontFamily;
    this.streamContext.fillText("Cannot connect to camera.", 30, 200);
  };

  an.Animator.prototype.setDimensions = function(w, h) {
    this.w = w;
    this.h = h;
    this.streamCanvas.width = this.w;
    this.streamCanvas.height = this.h;
    this.snapshotCanvas.width = this.w;
    this.snapshotCanvas.height = this.h;
  };

  an.Animator.prototype.videoCanPlayHandler = function(e) {
    var w = this.streamCanvas.width;
    var h = this.video.videoHeight / (this.video.videoWidth / w);
    this.setDimensions(w, h);
  };

  an.Animator.prototype.videoPlayHandler = function() {
    if (this.intervalID)
      clearInterval(this.intervalID);
    this.intervalID = setInterval(function() {
      if (this.video.paused || this.video.ended)
        return;
      this.streamContext.clearRect(0, 0, this.w, this.h);
      this.streamContext.drawImage(this.video, 0, 0, this.w, this.h);
    }.bind(this), 33);
  };

  an.Animator.prototype.videoStopHandler = function() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  };

  an.Animator.prototype.attachStream = function(sourceId) {
    this.video.addEventListener('canplay', this.videoCanPlayHandler.bind(this), false);
    this.video.addEventListener('play', this.videoPlayHandler.bind(this), false);
    this.video.addEventListener('pause', this.videoStopHandler.bind(this), false);
    this.video.addEventListener('ended', this.videoStopHandler.bind(this), false);
    this.video.addEventListener('error', this.videoStopHandler.bind(this), false);
    var constraints = {audio: false};
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
        this.video.src = window.URL.createObjectURL(stream);
        this.streamOn = true;
      }.bind(this),
      this.videoCannotPlayHandler.bind(this)
    );
  };

  an.Animator.prototype.detachStream = function () {
    if (!this.video.src)
      return;
    this.video.pause();
    this.streamOn = false;
    var objectUrl = this.video.src;
    this.video.src = null;
    URL.revokeObjectURL(objectUrl);
  };

  an.Animator.prototype.isPlaying = function() {
    return Boolean(this.playTimer);
  };

  an.Animator.prototype.toggleVideo = function() {
    if (this.video.paused) {
      this.video.play();
      this.streamOn = true;
    } else {
      this.video.pause();
      this.streamContext.clearRect(0, 0, this.w, this.h);
      this.streamOn = false;
      if (this.frames.length)
        this.drawFrame(this.frames.length - 1, this.streamContext);
    }
  };

  an.Animator.prototype.capture = function() {
    if (!this.streamOn)
      return;
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.drawImage(this.streamCanvas, 0, 0, this.w, this.h);
    var imageCanvas = document.createElement('canvas');
    imageCanvas.width = this.w;
    imageCanvas.height = this.h;
    imageCanvas.getContext('2d').drawImage(this.streamCanvas, 0, 0, this.w, this.h);
    this.frames.push(imageCanvas);
    this.saved = false;
  };

  an.Animator.prototype.undoCapture = function() {
    this.frames.pop();
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length)
      this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0);
    this.saved = false;
  };

  an.Animator.prototype.frameTimeout = function() {
    return 1000.0 / 24;
  };

  an.Animator.prototype.startPlay = function() {
    if (!this.frames.length)
      return;
    this.video.pause();
    this.snapshotCanvas.style.visibility = 'hidden';
    this.drawFrame(0, this.streamContext);
    this.playTimer = setTimeout(function() {this.playFrame(0)}.bind(this), this.frameTimeout());
  };

  an.Animator.prototype.endPlay = function() {
    if (this.isPlaying())
      clearTimeout(this.playTimer);
    this.playTimer = null;
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length)
      this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0, this.w, this.h);
    this.snapshotCanvas.style.visibility = null;
    if (this.streamOn)
      this.video.play();
  };

  an.Animator.prototype.drawFrame = function(frameNumber, context) {
    context.clearRect(0, 0, this.w, this.h);
    context.drawImage(this.frames[frameNumber], 0, 0);
  };

  an.Animator.prototype.playFrame = function(frameNumber) {
    if (frameNumber >= this.frames.length) {
      this.playTimer = setTimeout(function() {this.endPlay();}.bind(this), 1000);
      return;
    }
    this.drawFrame(frameNumber++, this.streamContext);
    this.playTimer = setTimeout(function() {
      this.playFrame(frameNumber)
    }.bind(this), this.frameTimeout());
  };

  an.Animator.prototype.togglePlay = function() {
    if (this.isPlaying())
      this.endPlay();
    else
      this.startPlay();
  };

  an.Animator.prototype.clear = function() {
    if (this.isPlaying())
      this.endPlay();
    if (this.frames.length == 0)
      return;
    this.frames = [];
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.streamContext.clearRect(0, 0, this.w, this.h);
    this.name = null;
    this.saved = false;
  };

  an.Animator.prototype.getFramePNG = function(idx) {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.drawImage(this.frames[idx], 0, 0);
    var dataUrl = this.snapshotCanvas.toDataURL();
    var binStr = atob(dataUrl.split(',')[1]);
    var arr = new Uint8Array(binStr.length - 8);
    for (var i = 8; i < binStr.length; i++)
      arr[i-8] = binStr.charCodeAt(i);
    return arr;
  };

  an.Animator.prototype.getFrameWebP = function(idx) {
     this.snapshotContext.clearRect(0, 0, this.w, this.h);
     this.snapshotContext.drawImage(this.frames[idx], 0, 0);
     return this.snapshotCanvas.toDataURL('image/webp');
  };

  an.Animator.prototype.getFrameVP8 = function(idx) {
    var dataUrl = this.getFrameWebP(idx);
    var binStr = atob(dataUrl.split(',')[1]);
    if (binStr.substr(0, 4) != 'RIFF')
      throw ('webp file does not start with RIFF.');
    if (binStr.substr(8, 4) != 'WEBP')
      throw ('webp file does not have WEBP identifier after RIFF.');
    var riffLen = (binStr.charCodeAt(7) << 24) | (binStr.charCodeAt(6) << 16) |
        (binStr.charCodeAt(5) << 8) | binStr.charCodeAt(4);
    if (riffLen != binStr.length - 8)
      throw ('webp file length is ' + binStr.length + ' but RIFF length field is ' + riffLen);
    var arr = new Uint8Array(binStr.length - 20);  // skip RIFF, riff-length, WEBP, VP8x, and VP8Length fields.
    var max = binStr.length - 20;
    for (var i = 0; i < max; i++)
      arr[i] = binStr.charCodeAt(i + 20);
    return arr;
  };

  an.Animator.prototype.loadFinished = function() {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length) {
      this.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.snapshotContext.drawImage(this.frames[this.frames.length-1], 0, 0, this.w, this.h);
      this.startPlay();
    }
  };

  an.Animator.prototype.addFrameVP8 = function(frameOffset, blob, idx) {
    var animator = this;
    var blobURL = URL.createObjectURL(blob);
    var image = new Image(this.w, this.h);
    this.framesInFlight++;
    image.src = blobURL;
    image.onerror = function(e) {
      if (image.triedvp8l) {
        console.log(e.type);
        animator.framesInFlight--;
        return;
      }
      image.triedvp8l = true;
      URL.revokeObjectURL(blobURL);
      blob = webm.vp8tovp8l(blob);
      blobURL = URL.createObjectURL(blob);
      image.src = blobURL;
    };
    image.onload = function() {
      var newCanvas = document.createElement('canvas');
      newCanvas.width = animator.w;
      newCanvas.height = animator.h;
      newCanvas.getContext('2d').drawImage(this, 0, 0, animator.w, animator.h);
      animator.frames[frameOffset + idx] = newCanvas;
      animator.framesInFlight--;
      URL.revokeObjectURL(blobURL);
      if (animator.framesInFlight == 0)
        animator.loadFinished();
    };
  };

  an.Animator.prototype.populate = function(frameOffset, width, height, frames) {
    this.setDimensions(width, height);
    for (var i = 0; i < frames.length; i++)
      this.frames[frameOffset + i] = frames[i];
    this.snapshotContext.clearRect(0, 0, width, height);
    this.snapshotContext.putImageData(frames[frames.length-1], 0, 0);
    this.startPlay();
  };

  an.Animator.prototype.save = function(filename, cb) {
    filename = filename || 'StopMotion';
    if (!filename.endsWith('.webm'))
      filename += '.webm';
    var title = filename.substr(0, filename.length - 5);
    var blob = webm.encode(title, this.w, this.h, this.frameTimeout(), this.frames.length, this.getFrameVP8.bind(this));
    var url = URL.createObjectURL(blob);
    var downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = url;
    this.exported = true;
    downloadLink.click();
    URL.revokeObjectURL(url);
    if (cb)
      cb();
  };

  an.Animator.prototype.load = function(file, cb) {
    var animator = this;
    var frameOffset = this.frames.length;
    var reader = new FileReader();
    if (file.name.endsWith('.webm')) {
      reader.onloadend = function() {
        var result = this.result;
        var max = result.length;
        var data = new Uint8Array(max);
        for (var i = 0; i < max; i++)
          data[i] = result.charCodeAt(i);
        webm.decode(data,
                    animator.setDimensions.bind(animator),
                    animator.addFrameVP8.bind(animator, frameOffset));
        this.saved = true;
        animator.name = file.name.substring(0, file.name.length - 5);
        if (cb)
          cb();
      };
    } else {
      reader.onloadend = function() {
        var decoder = new mng.Decoder(
          this.result,
          animator.snapshotContext,
          function(width, height, frames) {
            this.populate(frameOffset, width, height, frames);
            this.saved = false;
            var name = file.name;
            if (name && name.endsWith('.mng'))
              name = name.substring(0, name.length - 4);
            this.name = name;
            if (cb)
              cb();
          }.bind(animator));
        decoder.decode();
      };
    }
    reader.readAsBinaryString(file);
  };

})();
