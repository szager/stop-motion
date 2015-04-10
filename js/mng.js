'use strict';

var mng = mng || {};

(function() {
  mng.MNG_SIGNATURE = [138, 77, 78, 71, 13, 10, 26, 10];
  mng.PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

  // Encoder, for writing animations in mng format.

  mng.Encoder = function() {
    this.chunks = [];
    this.intBuf = new Uint8Array(4);
  };

  mng.Encoder.crcTable = null;
  mng.Encoder.computeCrcTable = function () {
    mng.Encoder.crcTable = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) {
        if (c & 1)
          c = 0xedb88320 ^ (c >> 1);
        else
          c = c >> 1;
      }
      mng.Encoder.crcTable[i] = c;
    }
  };

  mng.Encoder.prototype.encodeInt = function(i, arr, offset) {
    arr[offset] = (i >> 24) & 0xff;
    arr[offset+1] = (i >> 16) & 0xff;
    arr[offset+2] = (i >> 8) & 0xff;
    arr[offset+3] = i & 0xff;
  };

  mng.Encoder.prototype.writeInt = function(i) {
    this.encodeInt(i, this.intBuf, 0);
    this.chunks.push(new Uint8Array(this.intBuf));
  };

  mng.Encoder.prototype.writeCRC = function(type, arr) {
    if (!mng.Encoder.crcTable)
      mng.Encoder.computeCrcTable();
    var table = mng.Encoder.crcTable;
    var c = 0xffffffff;
    for (var n = 0; n < 4; n++)
      c = table[(c ^ type.charCodeAt(n)) & 0xff] ^ (c >> 8);
    for (var n = 0; n < arr.length; n++)
      c = table[(c ^ arr[n]) & 0xff] ^ (c >> 8);
    this.writeInt(c ^ 0xffffffff);
  };

  mng.Encoder.prototype.writeChunk = function (arr, type) {
    this.writeInt(arr.length);
    for (var i = 0; i < 4; i++)
      this.intBuf[i] = type.charCodeAt(i);
    this.chunks.push(new Uint8Array(this.intBuf));
    this.chunks.push(arr);
    this.writeCRC(type, arr);
  };

  mng.Encoder.prototype.writeSignature = function() {
    var arr = new Uint8Array(8);
    for (var i = 0; i < 8; i++)
      arr[i] = mng.MNG_SIGNATURE[i];
    this.chunks.push(arr);
  };

  mng.Encoder.prototype.writeHeader = function(width, height, frameCount) {
    var data = new Uint8Array(28);
    this.encodeInt(width, data, 0);   // Frame_width
    this.encodeInt(height, data, 4);   // Frame_height
    this.encodeInt(1, data, 8);            // Ticks_per_second
    this.encodeInt(0, data, 12);           // Nominal_layer_count
    this.encodeInt(frameCount, data, 16);  // Nominal_frame_count
    this.encodeInt(0, data, 20);           // Nominal_play_time
    this.encodeInt(0x80000000, data, 24);  // Simplicity_profile
    this.writeChunk(data, 'MHDR');
  };

  mng.Encoder.prototype.writeTerminationAction = function() {
    var data = new Uint8Array(1);
    data[0] = 3;  // when animation ends, repeat
    this.writeChunk(data, 'TERM');
  };

  mng.Encoder.prototype.writeTrailer = function() {
    this.writeChunk(new Uint8Array(0), 'MEND');
  };

  mng.Encoder.prototype.encode = function(width, height, frameCount, getFrameFunction) {
    this.writeSignature();
    this.writeHeader(width, height, frameCount);
    this.writeTerminationAction();
    for (var i = 0; i < frameCount; i++)
      this.chunks.push(getFrameFunction(i));
    this.writeTrailer();
    return new Blob(this.chunks);
  };

  // Decoder, for reading animations in mng format.

  mng.Decoder = function(data, context, finishedCallback) {
    this.data = new Uint8Array(data.length);
    this.context = context;
    this.finishedCallback = finishedCallback;
    for (var i = 0; i < data.length; i++)
      this.data[i] = data.charCodeAt(i);
    this.w = null;
    this.h = null;
    this.numFrames = 0;
    this.images = [];
    this.frames = [];
    this.kosher = false;  // Set to true after successful parsing
  };

  mng.Decoder.prototype.checkOffset = function(offset) {
    if (offset > this.data.length)
      throw 'mng.Decoder: Not enough bytes!';
  }

  mng.Decoder.prototype.decodeSignature = function(offset) {
    this.checkOffset(offset + 8);
    for (var i = 0; i < 8; i++) {
      if (this.data[offset+i] != mng.MNG_SIGNATURE[i])
	throw 'mng.Decoder: Byte ' + String(offset+i) + ' does not match the MNG signature.';
    }
    return offset + 8;
  }

  mng.Decoder.prototype.decodeChunkType = function(offset) {
    return String.fromCharCode(this.data[offset+4], this.data[offset+5],
                               this.data[offset+6], this.data[offset+7]);
  }

  mng.Decoder.prototype.decodeInt = function(offset) {
    return (
        (this.data[offset] << 24) |
        (this.data[offset+1] << 16) |
        (this.data[offset+2] << 8) |
        (this.data[offset+3]));
  }

  mng.Decoder.prototype.decodeHeader = function(offset) {
    this.checkOffset(offset + 36);
    var len = this.decodeInt(offset);
    if (len != 28)
      throw 'mngDecoder: Unexpected size of MHDR chunk.';
    if (this.decodeChunkType(offset) != 'MHDR')
      throw 'mng.Decoder: First chunk after signature is not MHDR.';
    this.w = this.decodeInt(offset+8);
    this.h = this.decodeInt(offset+12);
    this.numFrames = this.decodeInt(offset+24);
    return this.skipChunk(offset);
  }

  mng.Decoder.prototype.skipChunk = function(offset) {
    var len = this.decodeInt(offset);
    return offset + len + 12;
  };

  mng.Decoder.prototype.drawFrame = function(image, blobURL) {
    this.context.clearRect(0, 0, this.w, this.h);
    this.context.drawImage(image, 0, 0, this.w, this.h);
    this.frames.push(this.context.getImageData(0, 0, this.w, this.h));
  }

  mng.Decoder.prototype.decodeFramePNG = function(offset, cb) {
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
      signatureArr[i] = mng.PNG_SIGNATURE[i];
    var blob = new Blob([signatureArr, new Uint8Array(this.data.subarray(startOffset, offset))], {type: 'image/png'});
    var image = new Image(this.w, this.h);
    var blobURL = URL.createObjectURL(blob);
    image.src = blobURL;
    this.images.push(image);
    image.onload = function() {
      this.drawFrame(image, blobURL);
      URL.revokeObjectURL(blobURL);
      if (cb)
	cb();
    }.bind(this);
    return offset;
  };

  mng.Decoder.prototype.decode = function() {
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
          offset = this.decodeFramePNG(offset, function() {
	    if (this.finishedCallback && this.frames.length == this.images.length)
	      this.finishedCallback(this.w, this.h, this.frames);
	  }.bind(this));
        } else if (chunkType == 'MEND') {
          offset = this.skipChunk(offset);
          break;
        } else {
          throw 'mng.Decoder: Unexpected chunk type "' + chunkType + '" at offset ' + String(offset);
        }
      }
      if (offset != this.data.length)
        throw 'mng.Decoder: Unexpected trailing bytes.'
      if (this.numFrames != this.images.length)
        throw 'mng.Decoder: Mismatch between frame count in header and embedded PNG chunks.';
      this.kosher = true;
    } catch(e) {
      console.log(e);
    }
  };

})();
