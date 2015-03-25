// -*- mode: javascript; js-indent-level: 2 -*-
'use strict';

var webm = webm || {};

(function() {
  webm.ID_CODES = {
    'AlphaMode': [0x53, 0xC0],
    'AspectRatioType': [0x54, 0xB3],
    'AttachedFile': [0x61, 0xA7],
    'AttachmentLink': [0x74, 0x46],
    'Attachments': [0x19, 0x41, 0xA4, 0x69],
    'Audio': [0xE1],
    'BitDepth': [0x62, 0x64],
    'Block': [0xA1],
    'BlockAddID': [0xEE],
    'BlockAdditional': [0xA5],
    'BlockAdditions': [0x75, 0xA1],
    'BlockDuration': [0x9B],
    'BlockGroup': [0xA0],
    'BlockMore': [0xA6],
    'CRC-32': [0xBF],
    'Channels': [0x9F],
    'ChapCountry': [0x43, 0x7E],
    'ChapLanguage': [0x43, 0x7C],
    'ChapProcess': [0x69, 0x44],
    'ChapProcessCodecID': [0x69, 0x55],
    'ChapProcessCommand': [0x69, 0x11],
    'ChapProcessData': [0x69, 0x33],
    'ChapProcessPrivate': [0x45, 0x0D],
    'ChapProcessTime': [0x69, 0x22],
    'ChapString': [0x85],
    'ChapterAtom': [0xB6],
    'ChapterDisplay': [0x80],
    'ChapterFlagEnabled': [0x45, 0x98],
    'ChapterFlagHidden': [0x98],
    'ChapterPhysicalEquiv': [0x63, 0xC3],
    'ChapterSegmentEditionUID': [0x6E, 0xBC],
    'ChapterSegmentUID': [0x6E, 0x67],
    'ChapterStringUID': [0x56, 0x54],
    'ChapterTimeEnd': [0x92],
    'ChapterTimeStart': [0x91],
    'ChapterTrack': [0x8F],
    'ChapterTrackNumber': [0x89],
    'ChapterTranslate': [0x69, 0x24],
    'ChapterTranslateCodec': [0x69, 0xBF],
    'ChapterTranslateEditionUID': [0x69, 0xFC],
    'ChapterTranslateID': [0x69, 0xA5],
    'ChapterUID': [0x73, 0xC4],
    'Chapters': [0x10, 0x43, 0xA7, 0x70],
    'Cluster': [0x1F, 0x43, 0xB6, 0x75],
    'CodecDecodeAll': [0xAA],
    'CodecDelay': [0x56, 0xAA],
    'CodecID': [0x86],
    'CodecName': [0x25, 0x86, 0x88],
    'CodecPrivate': [0x63, 0xA2],
    'CodecState': [0xA4],
    'ColourSpace': [0x2E, 0xB5, 0x24],
    'ContentCompAlgo': [0x42, 0x54],
    'ContentCompSettings': [0x42, 0x55],
    'ContentCompression': [0x50, 0x34],
    'ContentEncAlgo': [0x47, 0xE1],
    'ContentEncKeyID': [0x47, 0xE2],
    'ContentEncoding': [0x62, 0x40],
    'ContentEncodingOrder': [0x50, 0x31],
    'ContentEncodingScope': [0x50, 0x32],
    'ContentEncodingType': [0x50, 0x33],
    'ContentEncodings': [0x6D, 0x80],
    'ContentEncryption': [0x50, 0x35],
    'ContentSigAlgo': [0x47, 0xE5],
    'ContentSigHashAlgo': [0x47, 0xE6],
    'ContentSigKeyID': [0x47, 0xE4],
    'ContentSignature': [0x47, 0xE3],
    'CueBlockNumber': [0x53, 0x78],
    'CueClusterPosition': [0xF1],
    'CueCodecState': [0xEA],
    'CueDuration': [0xB2],
    'CuePoint': [0xBB],
    'CueRefTime': [0x96],
    'CueReference': [0xDB],
    'CueRelativePosition': [0xF0],
    'CueTime': [0xB3],
    'CueTrack': [0xF7],
    'CueTrackPositions': [0xB7],
    'Cues': [0x1C, 0x53, 0xBB, 0x6B],
    'DateUTC': [0x44, 0x61],
    'DefaultDecodedFieldDuration': [0x23, 0x4E, 0x7A],
    'DefaultDuration': [0x23, 0xE3, 0x83],
    'DiscardPadding': [0x75, 0xA2],
    'DisplayHeight': [0x54, 0xBA],
    'DisplayUnit': [0x54, 0xB2],
    'DisplayWidth': [0x54, 0xB0],
    'DocType': [0x42, 0x82],
    'DocTypeReadVersion': [0x42, 0x85],
    'DocTypeVersion': [0x42, 0x87],
    'Duration': [0x44, 0x89],
    'EBML': [0x1A, 0x45, 0xDF, 0xA3],
    'EBMLMaxIDLength': [0x42, 0xF2],
    'EBMLMaxSizeLength': [0x42, 0xF3],
    'EBMLReadVersion': [0x42, 0xF7],
    'EBMLVersion': [0x42, 0x86],
    'EditionEntry': [0x45, 0xB9],
    'EditionFlagDefault': [0x45, 0xDB],
    'EditionFlagHidden': [0x45, 0xBD],
    'EditionFlagOrdered': [0x45, 0xDD],
    'EditionUID': [0x45, 0xBC],
    'FileData': [0x46, 0x5C],
    'FileDescription': [0x46, 0x7E],
    'FileMimeType': [0x46, 0x60],
    'FileName': [0x46, 0x6E],
    'FileUID': [0x46, 0xAE],
    'FlagDefault': [0x88],
    'FlagEnabled': [0xB9],
    'FlagForced': [0x55, 0xAA],
    'FlagInterlaced': [0x9A],
    'FlagLacing': [0x9C],
    'Info': [0x15, 0x49, 0xA9, 0x66],
    'LaceNumber': [0xCC],
    'Language': [0x22, 0xB5, 0x9C],
    'MaxBlockAdditionID': [0x55, 0xEE],
    'MaxCache': [0x6D, 0xF8],
    'MinCache': [0x6D, 0xE7],
    'MuxingApp': [0x4D, 0x80],
    'Name': [0x53, 0x6E],
    'NextFilename': [0x3E, 0x83, 0xBB],
    'NextUID': [0x3E, 0xB9, 0x23],
    'OutputSamplingFrequency': [0x78, 0xB5],
    'PixelCropBottom': [0x54, 0xAA],
    'PixelCropLeft': [0x54, 0xCC],
    'PixelCropRight': [0x54, 0xDD],
    'PixelCropTop': [0x54, 0xBB],
    'PixelHeight': [0xBA],
    'PixelWidth': [0xB0],
    'Position': [0xA7],
    'PrevFilename': [0x3C, 0x83, 0xAB],
    'PrevSize': [0xAB],
    'PrevUID': [0x3C, 0xB9, 0x23],
    'ReferenceBlock': [0xFB],
    'ReferencePriority': [0xFA],
    'SamplingFrequency': [0xB5],
    'Seek': [0x4D, 0xBB],
    'SeekHead': [0x11, 0x4D, 0x9B, 0x74],
    'SeekID': [0x53, 0xAB],
    'SeekPosition': [0x53, 0xAC],
    'SeekPreRoll': [0x56, 0xBB],
    'Segment': [0x18, 0x53, 0x80, 0x67],
    'SegmentFamily': [0x44, 0x44],
    'SegmentFilename': [0x73, 0x84],
    'SegmentUID': [0x73, 0xA4],
    'SilentTrackNumber': [0x58, 0xD7],
    'SilentTracks': [0x58, 0x54],
    'SimpleBlock': [0xA3],
    'SimpleTag': [0x67, 0xC8],
    'Slices': [0x8E],
    'StereoMode': [0x53, 0xB8],
    'Tag': [0x73, 0x73],
    'TagAttachmentUID': [0x63, 0xC6],
    'TagBinary': [0x44, 0x85],
    'TagChapterUID': [0x63, 0xC4],
    'TagDefault': [0x44, 0x84],
    'TagEditionUID': [0x63, 0xC9],
    'TagLanguage': [0x44, 0x7A],
    'TagName': [0x45, 0xA3],
    'TagString': [0x44, 0x87],
    'TagTrackUID': [0x63, 0xC5],
    'Tags': [0x12, 0x54, 0xC3, 0x67],
    'TargetType': [0x63, 0xCA],
    'TargetTypeValue': [0x68, 0xCA],
    'Targets': [0x63, 0xC0],
    'TimeSlice': [0xE8],
    'Timecode': [0xE7],
    'TimecodeScale': [0x2A, 0xD7, 0xB1],
    'Title': [0x7B, 0xA9],
    'TrackCombinePlanes': [0xE3],
    'TrackEntry': [0xAE],
    'TrackJoinBlocks': [0xE9],
    'TrackJoinUID': [0xED],
    'TrackNumber': [0xD7],
    'TrackOperation': [0xE2],
    'TrackOverlay': [0x6F, 0xAB],
    'TrackPlane': [0xE4],
    'TrackPlaneType': [0xE6],
    'TrackPlaneUID': [0xE5],
    'TrackTranslate': [0x66, 0x24],
    'TrackTranslateCodec': [0x66, 0xBF],
    'TrackTranslateEditionUID': [0x66, 0xFC],
    'TrackTranslateTrackID': [0x66, 0xA5],
    'TrackType': [0x83],
    'TrackUID': [0x73, 0xC5],
    'Tracks': [0x16, 0x54, 0xAE, 0x6B],
    'Video': [0xE0],
    'Void': [0xEC],
    'WritingApp': [0x57, 0x41],
  };

  webm.Encoder = function() {
    this.chunks = [];
    this.byteCount = 0;
  };

  webm.Encoder.addChunk(c) {
    this.chunks.push(c);
    this.byteCount += c.length;
    return c.length;
  };

  webm.Encoder.prototype.encodeUint = function(n) {
    if (n < 0)
      throw ('Cannot encode ' + n + ' as a uint.');
    if (n == 0)
      return new Uint8Array([0]);

    // Make the common case fast.
    if (n <= 0xffffffff) {
      var arr = [];
      while (n) {
        arr.push(n & 0xff);
        n = n >>> 8;
      }
      return new Uint8Array(arr.reverse());
    }

    var fb = new Uint8Array(new Float64Array([n]).buffer);
    var exponent = (((fb[7] & 0x7f) << 4) | ((fb[6] & 0xf0) >> 4)) - 1023;
    fb[6] = 0x10 | (fb[6] & 0xf);
    fb[7] = 0;
    var align = 7 - (exponent % 8);
    var numBytes = Math.ceil(exponent / 8);
    var arr = new Uint8Array(numBytes);
    if (align > 3) {
      for (var i = 0; i < numBytes; i++) {
        if (i > 7) {
          arr[i] = 0;
          continue;
        }
        var b = fb[7 - i] << 8;
        if (i < 7)
          b = b | fb[6 - i];
        arr[i] = (b >> (align - 3)) & 0xff;
      }
    } else {
      for (var i = 0; i < numBytes; i++) {
        if (i > 6) {
          arr[i] = 0;
          continue;
        }
        var b = fb[6 - i] << 8;
        if (i < 6)
          b = b | fb[5 - i];
        arr[i] = (b >> (5 + align)) & 0xff;
      }
    }

    return new Uint8Array(arr);
  };

  webm.Encoder.prototype.encodeInt = function(n) {
    if (n == 0)
      return new Uint8Array([0]);

    // Make the common case fast.
    if (n >= -0x800000 && n <= 0x7fffffff) {
      var signBit = n >>> 31;
      var arr = [];
      do {
        arr.push(n & 0xff);
        n = n >> 8;
      } while (n && ~n);
      if ((arr[arr.length - 1] >> 7) ^ signBit)
        arr.push(signBit ? 0xff : 0);
      return new Uint8Array(arr.reverse());
    }

    var fb = new Uint8Array(new Float64Array([n]).buffer);
    var exponent = (((fb[7] & 0x7f) << 4) | ((fb[6] & 0xf0) >> 4)) - 1023;
    var signBit = fb[7] >> 7;
    fb[6] = 0x10 | (fb[6] & 0xf);
    fb[7] = 0;
    var align = 7 - (exponent % 8);
    var numBytes = Math.ceil(exponent / 8);
    var arr = [];

    // Unrolled loops, likely a premature optimization.
    if (signBit) {

      // To encode negative numbers using bitwise operators, use the fact that
      // x = ~(-1 * x) + 1
      var carryBit = 1;
      if (align > 3) {
        for (var i = numBytes - 1; i >= 0; i--) {
          if (i > 7) {
            arr.push(0);
            continue;
          }
          var b = fb[7 - i] << 8;
          if (i < 7)
            b = b | fb[6 - i];
          b = (b >> (align - 3)) & 0xff;
          b = (~b & 0xff) + carryBit;
          carryBit = b >>> 8;
          b = b & 0xff;
          arr.push(b);
        }
      } else {
        for (var i = numBytes - 1; i >= 0; i--) {
          if (i > 6) {
            var b = 0xff + carryBit;
            carryBit = b >>> 8;
            arr.push(b & 0xff);
            continue;
          }
          var b = fb[6 - i] << 8;
          if (i < 6)
            b = b | fb[5 - i];
          b = (b >> (5 + align)) & 0xff;
          b = (~b & 0xff) + carryBit;
          carryBit = b >>> 8;
          b = b & 0xff;
          arr.push(b);
        }
      }
    } else {
      if (align > 3) {
        for (var i = numBytes - 1; i >= 0; i--) {
          if (i > 7) {
            arr.push(0);
            continue;
          }
          var b = fb[7 - i] << 8;
          if (i < 7)
            b = b | fb[6 - i];
          b = (b >> (align - 3)) & 0xff;
          arr.push(b);
        }
      } else {
        for (var i = numBytes - 1; i < 0; i--) {
          if (i > 6) {
            arr.push(0);
            continue;
          }
          var b = fb[6 - i] << 8;
          if (i < 6)
            b = b | fb[5 - i];
          b = (b >> (5 + align)) & 0xff;
          arr.push(b);
        }
      }
    }

    if ((arr[arr.length - 1] >> 7) ^ signBit)
      arr.push(signBit ? 0xff : 0);
    return new Uint8Array(arr.reverse());
  };

  webm.Encoder.prototype.encodeID = function(id) {
    var code = webm.ID_CODES[id];
    if (!code)
      throw ('Unknown webm chunk id: ' + id);
    return new Uint8Array(code);
  };

  webm.Encoder.prototype.encodeLength = function(l) {
    arr = [];
    if (l == 0) {
      arr.push(0);
    } else if (l < 0x7f) {
      arr.push(0x80 | l);
    } else if (l < 0x3fff) {
      arr.push(0x40 | (l >> 8));
      arr.push(l & 0xff);
    } else if (l < 0x1fffff) {
      arr.push(0x20 | (l >> 16));
      arr.push((l >> 8) & 0xff);
      arr.push(l & 0xff);
    } else if (l < 0xfffffff) {
      arr.push(0x10 | (l >> 24));
      arr.push((l >> 16) & 0xff);
      arr.push((l >> 8) & 0xff);
      arr.push(l & 0xff);
    } else if (l <= 0xffffffff) {
      arr.push(0x80);
      arr.push(l >> 24);
      arr.push((l >> 16) & 0xff);
      arr.push((l >> 8) & 0xff);
      arr.push(l & 0xff);
    } else if (l < 0x7ffffffff) {
      var uintArr = webm.Encoder.prototype.encodeUint(l);
      if (uintArr.length != 5)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x8;
      return uintArr;
    } else if (l < 0x3ffffffffff) {
      var uintArr = webm.Encoder.prototype.encodeUint(l);
      if (uintArr.length != 6)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x4;
      return uintArr;
    } else if (l < 0x1ffffffffffff) {
      var uintArr = webm.Encoder.prototype.encodeUint(l);
      if (uintArr.length != 7)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x2;
      return uintArr;
    } else if (l < 0xffffffffffffff) {
      var uintArr = webm.Encoder.prototype.encodeUint(l);
      if (uintArr.length != 8)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x1;
      return uintArr;
    } else {
      throw ('Cannot encode length ' + l);
    }
    return new Uint8Array(arr);
  };

  webm.Encoder.prototype.encodeChunk = function(id, payload) {
    var encodedID = this.encodeID(id);
    var encodedLength = this.encodeLength(payload.length);
    this.chunks.append(encodedID);
    this.chunks.append(encodedLength);
    this.chunks.append(payload);
    return encodedID.length + encodedLength.length + payload.length;
  };
})();
