'use strict';

var animator = animator || {};

(function() {
  var an = animator;

  an.MNG_SIGNATURE = [138, 77, 78, 71, 13, 10, 26, 10];
  an.PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

  an.Animator = function(video, streamCanvas, snapshotCanvas) {
    this.video = video;
    this.streamCanvas = streamCanvas;
    this.streamContext = streamCanvas.getContext('2d');
    this.snapshotCanvas = snapshotCanvas;
    this.snapshotContext = snapshotCanvas.getContext('2d');
    this.frames = [];
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
    console.log('videoCanPlayHandler');
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

  an.Animator.prototype.attachStream = function() {
    this.video.addEventListener('canplay', this.videoCanPlayHandler.bind(this), false);
    this.video.addEventListener('play', this.videoPlayHandler.bind(this), false);
    this.video.addEventListener('pause', this.videoStopHandler.bind(this), false);
    this.video.addEventListener('ended', this.videoStopHandler.bind(this), false);
    this.video.addEventListener('error', this.videoStopHandler.bind(this), false);
    navigator.getUserMedia(
      {audio: false, video: true},
      function(stream) {
        this.video.src = window.URL.createObjectURL(stream);
      }.bind(this),
      this.videoCannotPlayHandler.bind(this)
    );
  };

  an.Animator.prototype.isPlaying = function() {
    return Boolean(this.playTimer);
  };

  an.Animator.prototype.toggleVideo = function() {
    if (this.video.paused)
      this.video.play();
    else
      this.video.pause();
  };

  an.Animator.prototype.capture = function() {
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.snapshotContext.drawImage(this.streamCanvas, 0, 0, this.w, this.h);
    var imageData = this.snapshotContext.getImageData(0, 0, this.w, this.h);
    this.frames.push(imageData);
  };

  an.Animator.prototype.undoCapture = function() {
    this.frames.pop();
    this.snapshotContext.clearRect(0, 0, this.w, this.h);
    if (this.frames.length)
      this.snapshotContext.putImageData(this.frames[this.frames.length-1], 0, 0);
  };

  an.Animator.prototype.frameTimeout = function() {
    var playbackSpeedSelector = document.getElementById('playbackSpeed');
    return 1000.0 / playbackSpeedSelector.value;
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
  };

  an.Animator.prototype.save = function() {
    chrome.fileSystem.chooseEntry(
      {
	type: 'saveFile',
        suggestedName: 'MyAnimation.mng'
      },
      function(entry) {
        if (!entry)
          return;
	entry.createWriter(function(fileWriter) {
	  var encoder = new an.MngEncoder(this, fileWriter);
	  encoder.encode();
	}.bind(this), function(err) {console.log(err)});
      }.bind(this)
    );
  };

  an.Animator.prototype.load = function() {
    var animator = this;
    chrome.fileSystem.chooseEntry({
      type: 'openFile',
      accepts: [{extensions: ['mng']}],
      acceptsMultiple: false
    }, function(entry) {
      if (!entry.length)
        return;
      entry[0].file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function() {
          var decoder = new an.MngDecoder(animator, this.result);
          decoder.decode();
        };
        reader.readAsBinaryString(file);
      });
    });
  };

  // MngEncoder, for writing animations in mng format.

  an.MngEncoder = function(animator, fileWriter) {
    this.animator = animator;
    this.fileWriter = fileWriter;
    this.chunks = [];
    this.intBuf = new Uint8Array(4);
  };

  an.MngEncoder.crcTable = null;
  an.MngEncoder.computeCrcTable = function () {
    an.MngEncoder.crcTable = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) {
        if (c & 1)
          c = 0xedb88320 ^ (c >> 1);
        else
          c = c >> 1;
      }
      an.MngEncoder.crcTable[i] = c;
    }
  };

  an.MngEncoder.prototype.encodeInt = function(i, arr, offset) {
    arr[offset] = (i >> 24) & 0xff;
    arr[offset+1] = (i >> 16) & 0xff;
    arr[offset+2] = (i >> 8) & 0xff;
    arr[offset+3] = i & 0xff;
  };

  an.MngEncoder.prototype.writeInt = function(i) {
    this.encodeInt(i, this.intBuf, 0);
    this.chunks.push(new Uint8Array(this.intBuf));
  };

  an.MngEncoder.prototype.writeCRC = function(type, arr) {
    if (!an.MngEncoder.crcTable)
      an.MngEncoder.computeCrcTable();
    var table = an.MngEncoder.crcTable;
    var c = 0xffffffff;
    for (var n = 0; n < 4; n++)
      c = table[(c ^ type.charCodeAt(n)) & 0xff] ^ (c >> 8);
    for (var n = 0; n < arr.length; n++)
      c = table[(c ^ arr[n]) & 0xff] ^ (c >> 8);
    this.writeInt(c ^ 0xffffffff);
  };

  an.MngEncoder.prototype.writeChunk = function (arr, type) {
    this.writeInt(arr.length);
    for (var i = 0; i < 4; i++)
      this.intBuf[i] = type.charCodeAt(i);
    this.chunks.push(new Uint8Array(this.intBuf));
    this.chunks.push(arr);
    this.writeCRC(type, arr);
  };

  an.MngEncoder.prototype.writeSignature = function() {
    var arr = new Uint8Array(8);
    for (var i = 0; i < 8; i++)
      arr[i] = an.MNG_SIGNATURE[i];
    this.chunks.push(arr);
  };

  an.MngEncoder.prototype.writeHeader = function() {
    var frameCount = this.animator.frames.length;
    var data = new Uint8Array(28);
    this.encodeInt(this.animator.w, data, 0);   // Frame_width
    this.encodeInt(this.animator.h, data, 4);   // Frame_height
    this.encodeInt(1, data, 8);            // Ticks_per_second
    this.encodeInt(0, data, 12);           // Nominal_layer_count
    this.encodeInt(frameCount, data, 16);  // Nominal_frame_count
    this.encodeInt(0, data, 20);           // Nominal_play_time
    this.encodeInt(0x80000000, data, 24);  // Simplicity_profile
    this.writeChunk(data, 'MHDR');
  };

  an.MngEncoder.prototype.writeTerminationAction = function() {
    var data = new Uint8Array(1);
    data[0] = 3;  // when animation ends, repeat
    this.writeChunk(data, 'TERM');
  };

  an.MngEncoder.prototype.writeTrailer = function() {
    this.writeChunk(new Uint8Array(0), 'MEND');
  };

  an.MngEncoder.prototype.getFramePNG = function(i) {
    this.animator.snapshotContext.clearRect(0, 0, this.animator.w, this.animator.h);
    this.animator.snapshotContext.putImageData(this.animator.frames[i], 0, 0);
    var dataUrl = this.animator.snapshotCanvas.toDataURL();
    var binStr = atob(dataUrl.split(',')[1]);
    var arr = new Uint8Array(binStr.length - 8);
    for (var i = 8; i < binStr.length; i++)
      arr[i-8] = binStr.charCodeAt(i);
    return arr;
  };

  an.MngEncoder.prototype.encode = function() {
    this.writeSignature();
    this.writeHeader();
    this.writeTerminationAction();
    for (var i = 0; i < this.animator.frames.length; i++)
      this.chunks.push(this.getFramePNG(i));
    this.writeTrailer();
    this.blob = new Blob(this.chunks);
    this.fileWriter.onwriteend = function() {
      this.fileWriter.onwriteend = null;
      this.fileWriter.truncate(this.blob.size);
    }.bind(this);
    this.fileWriter.write(new Blob(this.chunks));
  };

  // MngDecoder, for reading animations in mng format.

  an.MngDecoder = function(animator, data) {
    this.animator = animator;
    this.data = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++)
      this.data[i] = data.charCodeAt(i);
    this.w = null;
    this.h = null;
    this.numFrames = 0;
    this.images = [];
    this.frames = [];
    this.kosher = false;  // Set to true after successful parsing
  };

  an.MngDecoder.prototype.checkOffset = function(offset) {
    if (offset > this.data.length)
      throw 'MngDecoder: Not enough bytes!';
  }

  an.MngDecoder.prototype.decodeSignature = function(offset) {
    this.checkOffset(offset + 8);
    for (var i = 0; i < 8; i++) {
      if (this.data[offset+i] != an.MNG_SIGNATURE[i])
	throw 'MngDecoder: Byte ' + String(offset+i) + ' does not match the MNG signature.';
    }
    return offset + 8;
  }

  an.MngDecoder.prototype.decodeChunkType = function(offset) {
    return String.fromCharCode(this.data[offset+4], this.data[offset+5],
                               this.data[offset+6], this.data[offset+7]);
  }

  an.MngDecoder.prototype.decodeInt = function(offset) {
    return (
        (this.data[offset] << 24) |
        (this.data[offset+1] << 16) |
        (this.data[offset+2] << 8) |
        (this.data[offset+3]));
  }

  an.MngDecoder.prototype.decodeHeader = function(offset) {
    this.checkOffset(offset + 36);
    var len = this.decodeInt(offset);
    if (len != 28)
      throw 'MngDecoder: Unexpected size of MHDR chunk.';
    if (this.decodeChunkType(offset) != 'MHDR')
      throw 'MngDecoder: First chunk after signature is not MHDR.';
    this.w = this.decodeInt(offset+8);
    this.h = this.decodeInt(offset+12);
    this.numFrames = this.decodeInt(offset+24);
    return this.skipChunk(offset);
  }

  an.MngDecoder.prototype.skipChunk = function(offset) {
    var len = this.decodeInt(offset);
    return offset + len + 12;
  };

  an.MngDecoder.prototype.drawFrame = function(image, blobURL) {
      this.animator.snapshotContext.clearRect(0, 0, this.w, this.h);
      this.animator.snapshotContext.drawImage(image, 0, 0, this.w, this.h);
      this.frames.push(this.animator.snapshotContext.getImageData(0, 0, this.w, this.h));
      URL.revokeObjectURL(blobURL);
      if (this.frames.length == this.images.length)
        this.populateAnimator();
  }

  an.MngDecoder.prototype.decodeFramePNG = function(offset) {
    var startOffset = offset;
    while (true) {
      this.checkOffset(offset + 12);
      var chunkType = this.decodeChunkType(offset);
      offset = this.skipChunk(offset);
      if (chunkType == 'IEND')
        break;
    }
    var signatureArr = new Uint8Array(8);
    for (var i = 0; i < 8; i++)
      signatureArr[i] = an.PNG_SIGNATURE[i];
    var blob = new Blob([signatureArr, new Uint8Array(this.data.subarray(startOffset, offset))], {type: 'image/png'});
    var image = new Image(this.w, this.h);
    var blobURL = URL.createObjectURL(blob);
    image.src = blobURL;
    this.images.push(image);
    image.onload = function() {this.drawFrame(image, blobURL)}.bind(this);
    return offset;
  };

  an.MngDecoder.prototype.populateAnimator = function() {
    this.animator.frames = this.frames;
    this.animator.w = this.w;
    this.animator.h = this.h;
    this.animator.resizeCanvases();
    this.animator.snapshotContext.clearRect(0, 0, this.w, this.h);
    this.animator.snapshotContext.putImageData(this.frames[this.frames.length-1], 0, 0);
    this.frames = [];
    this.numFrames = 0;
    this.w = null;
    this.h = null;
  };

  an.MngDecoder.prototype.decode = function() {
    try {
      var offset = 0;
      offset = this.decodeSignature(offset);
      offset = this.decodeHeader(offset);
      while (true) {
        this.checkOffset(offset + 12);
        var chunkType = this.decodeChunkType(offset);
        if (chunkType == 'TERM') {
          offset = this.skipChunk(offset);
        } else if (chunkType == 'IHDR') {
          offset = this.decodeFramePNG(offset);
        } else if (chunkType == 'MEND') {
          offset = this.skipChunk(offset);
          break;
        } else {
          throw "MngDecoder: Unexpected chunk type '" + chunkType + "' at offset " + String(offset);
        }
      }
      if (offset != this.data.length)
        throw 'MngDecoder: Unexpected trailing bytes.'
      if (this.numFrames != this.images.length)
        throw 'MngDecoder: Mismatch between frame count in header and embedded PNG chunks.';
      this.kosher = true;
    } catch(e) {
      console.log(e);
    }
  };
})();
