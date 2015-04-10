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
    this.exported = false;
  };

  an.Animator.prototype.videoCannotPlayHandler = function(e) {
    console.log('navigator.getUserMedia error: ', e);
    this.streamContext.font = "36px " + getComputedStyle(this.streamCanvas).fontFamily;
    this.streamContext.fillText("Cannot connect to camera.", 30, 200);
  };

  an.Animator.prototype.resizeCanvases = function() {
    this.streamCanvas.width = this.w;
    this.streamCanvas.height = this.h;
    this.snapshotCanvas.width = this.w;
    this.snapshotCanvas.height = this.h;
  };

  an.Animator.prototype.videoCanPlayHandler = function(e) {
    this.w = this.streamCanvas.width;
    this.h = this.video.videoHeight / (this.video.videoWidth / this.w);
    this.resizeCanvases();
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
    var imageData = this.snapshotContext.getImageData(0, 0, this.w, this.h);
    this.frames.push(imageData);
    this.saved = false;
    this.exported = false;
  };

  an.Animator.prototype.undoCapture = function() {
    this.frames.pop();
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length)
      this.snapshotContext.putImageData(this.frames[this.frames.length-1], 0, 0);
    this.saved = false;
    this.exported = false;
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
    this.snapshotCanvas.style.visibility = null;
    if (this.streamOn)
      this.video.play();
  };

  an.Animator.prototype.drawFrame = function(frameNumber, context) {
    context.clearRect(0, 0, this.w, this.h);
    context.putImageData(this.frames[frameNumber], 0, 0);
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
    this.saved = false;
    this.exported = false;
  };

  an.Animator.prototype.getFramePNG = function(idx) {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.putImageData(this.frames[idx], 0, 0);
    var dataUrl = this.snapshotCanvas.toDataURL();
    var binStr = atob(dataUrl.split(',')[1]);
    var arr = new Uint8Array(binStr.length - 8);
    for (var i = 8; i < binStr.length; i++)
      arr[i-8] = binStr.charCodeAt(i);
    return arr;
  };

  an.Animator.prototype.getFrameWebP = function(idx) {
     this.snapshotContext.clearRect(0, 0, this.w, this.h);
     this.snapshotContext.putImageData(this.frames[idx], 0, 0);
     var dataUrl = this.snapshotCanvas.toDataURL('image/webp', 1.0);
    return dataUrl;
  };

  an.Animator.prototype.getFrameVP8 = function(idx) {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.putImageData(this.frames[idx], 0, 0);
    var dataUrl = this.snapshotCanvas.toDataURL('image/webp', 1.0);
    var binStr = atob(dataUrl.split(',')[1]);
    if (binStr.substr(0, 4) != 'RIFF')
      throw ('webp file does not start with RIFF.');
    if (binStr.substr(8, 4) != 'WEBP')
      throw ('webp file does not have WEBP identifier after RIFF.');
    var riffLen = (binStr.charCodeAt(4) << 24) | (binStr.charCodeAt(5) << 16) |
	(binStr.charCodeAt(6) << 8) | binStr.charCodeAt(7);
    if (riffLen != binStr.length - 8)
      throw ('webp file length is ' + binStr.length + ' but RIFF length field is ' + riffLen);
    var arr = new Uint8Array(binStr.length - 16);  // skip RIFF, length, WEBP and VP8x fields.
    var max = binStr.length;
    for (var i = 0; i < max; i++)
      arr[i] = binStr.charCodeAt(i + 16);
    return arr;
  };

  an.Animator.prototype.populate = function(width, height, frames) {
    this.w = width;
    this.h = height;
    this.frames = frames;
    this.resizeCanvases();
    this.snapshotContext.clearRect(0, 0, width, height);
    this.snapshotContext.putImageData(frames[frames.length-1], 0, 0);
    this.startPlay();
  };

  an.Animator.prototype.save = function(filename, cb) {
    var encoder = new mng.Encoder();
    var blob = encoder.encode(this.w, this.h, this.frames.length, this.getFramePNG.bind(this));
    var url = URL.createObjectURL(blob);
    var downloadLink = document.createElement('a');
    downloadLink.download = filename || "StopMotion.mng";
    downloadLink.href = url;
    if (filename) {
      if (filename.endsWith('.mng'))
        this.name = filename.substring(0, filename.length - 4);
      else
        this.name = filename;
    }
    this.saved = true;
    downloadLink.click();
    URL.revokeObjectURL(url);
    if (cb)
      cb();
  };

  an.Animator.prototype.whammyExport = function(filename, cb) {
    var encoder = new Whammy.Video(1000.0 / this.frameTimeout());
    for (var i = 0; i < this.frames.length; i++)
      encoder.add(this.getFrameWebP(i));
    var blob = encoder.compile();
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

  an.Animator.prototype.export = function(filename, cb) {
    var encoder = new webm.Encoder();
    filename = filename || 'StopMotion';
    if (!filename.endsWith('.webm'))
      filename += '.webm';
    var title = filename.substr(0, filename.length - 5);
    var blob = encoder.encode(title, this.w, this.h, this.frameTimeout(), this.frames.length, this.getFramesVP8.bind(this));
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
    var reader = new FileReader();
    this.saved = true;
    this.exported = false;
    reader.onloadend = function() {
      var decoder = new mng.Decoder(
	  this.result,
	  animator.snapshotContext,
	  function(width, height, frames) {
	    this.populate(width, height, frames);
	    var name = file.name;
	    if (name && name.endsWith('.mng'))
	      name = name.substring(0, name.length - 4);
	    this.name = name;
	    if (cb)
	      cb();
	  }.bind(animator));
      decoder.decode();
    };
    reader.readAsBinaryString(file);
  };

})();
