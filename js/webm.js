/* -*- mode: javascript; js-indent-level: 2 -*- */
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
    'WritingApp': [0x57, 0x41]
  };

  webm.ID_NAMES = {
    0x53C0: 'AlphaMode',
    0x54B3: 'AspectRatioType',
    0x61A7: 'AttachedFile',
    0x7446: 'AttachmentLink',
    0x1941A469: 'Attachments',
    0xE1: 'Audio',
    0x6264: 'BitDepth',
    0xA1: 'Block',
    0xEE: 'BlockAddID',
    0xA5: 'BlockAdditional',
    0x75A1: 'BlockAdditions',
    0x9B: 'BlockDuration',
    0xA0: 'BlockGroup',
    0xA6: 'BlockMore',
    0xBF: 'CRC-32',
    0x9F: 'Channels',
    0x437E: 'ChapCountry',
    0x437C: 'ChapLanguage',
    0x6944: 'ChapProcess',
    0x6955: 'ChapProcessCodecID',
    0x6911: 'ChapProcessCommand',
    0x6933: 'ChapProcessData',
    0x450D: 'ChapProcessPrivate',
    0x6922: 'ChapProcessTime',
    0x85: 'ChapString',
    0xB6: 'ChapterAtom',
    0x80: 'ChapterDisplay',
    0x4598: 'ChapterFlagEnabled',
    0x98: 'ChapterFlagHidden',
    0x63C3: 'ChapterPhysicalEquiv',
    0x6EBC: 'ChapterSegmentEditionUID',
    0x6E67: 'ChapterSegmentUID',
    0x5654: 'ChapterStringUID',
    0x92: 'ChapterTimeEnd',
    0x91: 'ChapterTimeStart',
    0x8F: 'ChapterTrack',
    0x89: 'ChapterTrackNumber',
    0x6924: 'ChapterTranslate',
    0x69BF: 'ChapterTranslateCodec',
    0x69FC: 'ChapterTranslateEditionUID',
    0x69A5: 'ChapterTranslateID',
    0x73C4: 'ChapterUID',
    0x1043A770: 'Chapters',
    0x1F43B675: 'Cluster',
    0xAA: 'CodecDecodeAll',
    0x56AA: 'CodecDelay',
    0x86: 'CodecID',
    0x258688: 'CodecName',
    0x63A2: 'CodecPrivate',
    0xA4: 'CodecState',
    0x2EB524: 'ColourSpace',
    0x4254: 'ContentCompAlgo',
    0x4255: 'ContentCompSettings',
    0x5034: 'ContentCompression',
    0x47E1: 'ContentEncAlgo',
    0x47E2: 'ContentEncKeyID',
    0x6240: 'ContentEncoding',
    0x5031: 'ContentEncodingOrder',
    0x5032: 'ContentEncodingScope',
    0x5033: 'ContentEncodingType',
    0x6D80: 'ContentEncodings',
    0x5035: 'ContentEncryption',
    0x47E5: 'ContentSigAlgo',
    0x47E6: 'ContentSigHashAlgo',
    0x47E4: 'ContentSigKeyID',
    0x47E3: 'ContentSignature',
    0x5378: 'CueBlockNumber',
    0xF1: 'CueClusterPosition',
    0xEA: 'CueCodecState',
    0xB2: 'CueDuration',
    0xBB: 'CuePoint',
    0x96: 'CueRefTime',
    0xDB: 'CueReference',
    0xF0: 'CueRelativePosition',
    0xB3: 'CueTime',
    0xF7: 'CueTrack',
    0xB7: 'CueTrackPositions',
    0x1C53BB6B: 'Cues',
    0x4461: 'DateUTC',
    0x234E7A: 'DefaultDecodedFieldDuration',
    0x23E383: 'DefaultDuration',
    0x75A2: 'DiscardPadding',
    0x54BA: 'DisplayHeight',
    0x54B2: 'DisplayUnit',
    0x54B0: 'DisplayWidth',
    0x4282: 'DocType',
    0x4285: 'DocTypeReadVersion',
    0x4287: 'DocTypeVersion',
    0x4489: 'Duration',
    0x1A45DFA3: 'EBML',
    0x42F2: 'EBMLMaxIDLength',
    0x42F3: 'EBMLMaxSizeLength',
    0x42F7: 'EBMLReadVersion',
    0x4286: 'EBMLVersion',
    0x45B9: 'EditionEntry',
    0x45DB: 'EditionFlagDefault',
    0x45BD: 'EditionFlagHidden',
    0x45DD: 'EditionFlagOrdered',
    0x45BC: 'EditionUID',
    0x465C: 'FileData',
    0x467E: 'FileDescription',
    0x4660: 'FileMimeType',
    0x466E: 'FileName',
    0x46AE: 'FileUID',
    0x88: 'FlagDefault',
    0xB9: 'FlagEnabled',
    0x55AA: 'FlagForced',
    0x9A: 'FlagInterlaced',
    0x9C: 'FlagLacing',
    0x1549A966: 'Info',
    0xCC: 'LaceNumber',
    0x22B59C: 'Language',
    0x55EE: 'MaxBlockAdditionID',
    0x6DF8: 'MaxCache',
    0x6DE7: 'MinCache',
    0x4D80: 'MuxingApp',
    0x536E: 'Name',
    0x3E83BB: 'NextFilename',
    0x3EB923: 'NextUID',
    0x78B5: 'OutputSamplingFrequency',
    0x54AA: 'PixelCropBottom',
    0x54CC: 'PixelCropLeft',
    0x54DD: 'PixelCropRight',
    0x54BB: 'PixelCropTop',
    0xBA: 'PixelHeight',
    0xB0: 'PixelWidth',
    0xA7: 'Position',
    0x3C83AB: 'PrevFilename',
    0xAB: 'PrevSize',
    0x3CB923: 'PrevUID',
    0xFB: 'ReferenceBlock',
    0xFA: 'ReferencePriority',
    0xB5: 'SamplingFrequency',
    0x4DBB: 'Seek',
    0x114D9B74: 'SeekHead',
    0x53AB: 'SeekID',
    0x53AC: 'SeekPosition',
    0x56BB: 'SeekPreRoll',
    0x18538067: 'Segment',
    0x4444: 'SegmentFamily',
    0x7384: 'SegmentFilename',
    0x73A4: 'SegmentUID',
    0x58D7: 'SilentTrackNumber',
    0x5854: 'SilentTracks',
    0xA3: 'SimpleBlock',
    0x67C8: 'SimpleTag',
    0x8E: 'Slices',
    0x53B8: 'StereoMode',
    0x7373: 'Tag',
    0x63C6: 'TagAttachmentUID',
    0x4485: 'TagBinary',
    0x63C4: 'TagChapterUID',
    0x4484: 'TagDefault',
    0x63C9: 'TagEditionUID',
    0x447A: 'TagLanguage',
    0x45A3: 'TagName',
    0x4487: 'TagString',
    0x63C5: 'TagTrackUID',
    0x1254C367: 'Tags',
    0x63CA: 'TargetType',
    0x68CA: 'TargetTypeValue',
    0x63C0: 'Targets',
    0xE8: 'TimeSlice',
    0xE7: 'Timecode',
    0x2AD7B1: 'TimecodeScale',
    0x7BA9: 'Title',
    0xE3: 'TrackCombinePlanes',
    0xAE: 'TrackEntry',
    0xE9: 'TrackJoinBlocks',
    0xED: 'TrackJoinUID',
    0xD7: 'TrackNumber',
    0xE2: 'TrackOperation',
    0x6FAB: 'TrackOverlay',
    0xE4: 'TrackPlane',
    0xE6: 'TrackPlaneType',
    0xE5: 'TrackPlaneUID',
    0x6624: 'TrackTranslate',
    0x66BF: 'TrackTranslateCodec',
    0x66FC: 'TrackTranslateEditionUID',
    0x66A5: 'TrackTranslateTrackID',
    0x83: 'TrackType',
    0x73C5: 'TrackUID',
    0x1654AE6B: 'Tracks',
    0xE0: 'Video',
    0xEC: 'Void',
    0x5741: 'WritingApp'
  };

  webm.Encoder = function() {};

  webm.Encoder.encodeUint = function(n) {
    if (n < 0)
      throw ('Cannot encode ' + n + ' as a uint.');

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

  webm.Encoder.prototype.encodeInt = function(n, numBytes) {
    if (numBytes) {
      var arr = [];
      for (; numBytes > 0; numBytes--) {
	arr.push(n & 0xff);
	n = n >> 8;
      }
      arr.reverse();
      return new Uint8Array(arr);
    }

    if (n == 0)
      return new Uint8Array([]);

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
      // x = ~(-x) + 1
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

  webm.Encoder.prototype.encodeFloat32 = function(f) {
    var arr = new Uint8Array(new Float32Array([f]).buffer);
    Array.prototype.reverse.bind(arr)();
    return arr;
  };

  webm.Encoder.prototype.encodeFloat64 = function(f) {
    var arr = new Uint8Array(new Float64Array([f]).buffer);
    Array.prototype.reverse.bind(arr)();
    return arr;
  };

  webm.Encoder.prototype.encodeString = function(s) {
    var arr = [];
    for (var i = 0; i < s.length; i++)
      arr.push(s.charCodeAt(i));
    return new Uint8Array(arr);
  };

  webm.Encoder.prototype.encodeID = function(id) {
    var code = webm.ID_CODES[id];
    if (!code)
      throw ('Unknown webm chunk id: ' + id);
    return new Uint8Array(code);
  };

  webm.Encoder.prototype.encodeLength = function(l) {
    var arr = [];
    if (l < 0x7f) {
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
      var uintArr = webm.Encoder.encodeUint(l);
      if (uintArr.length != 5)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x8;
      return uintArr;
    } else if (l < 0x3ffffffffff) {
      var uintArr = webm.Encoder.encodeUint(l);
      if (uintArr.length != 6)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x4;
      return uintArr;
    } else if (l < 0x1ffffffffffff) {
      var uintArr = webm.Encoder.encodeUint(l);
      if (uintArr.length != 7)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x2;
      return uintArr;
    } else if (l < 0xffffffffffffff) {
      var uintArr = webm.Encoder.encodeUint(l);
      if (uintArr.length != 8)
        throw ('Encoding of length ' + l + ' has ' + uintArr.length + ' bytes.');
      uintArr[0] |= 0x1;
      return uintArr;
    } else {
      throw ('Cannot encode length ' + l);
    }
    return new Uint8Array(arr);
  };

  /* Note All of the encode*Chunk methods add id, length, and payload in reverse
     order (i.e., payload, length, id).  This is to avoid calls to Array.unshift(),
     which is probably inefficient.  After all the chunks have been encoded, the
     entire array must be reversed (chunks.reverse()).
  */

  webm.Encoder.prototype.encodeDataChunk = function(id, length, chunks) {
    var encodedID = this.encodeID(id);
    var encodedLength = this.encodeLength(length);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + length;
  };

  webm.Encoder.prototype.encodeIntChunk = function(id, value, chunks) {
    var encodedID = this.encodeID(id);
    var encodedValue = this.encodeInt(value);
    var encodedLength = this.encodeLength(encodedValue.length);
    chunks.push(encodedValue);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + encodedValue.length;
  };

  webm.Encoder.prototype.encodeUintChunk = function(id, value, chunks) {
    var encodedID = this.encodeID(id);
    var encodedValue = webm.Encoder.encodeUint(value);
    var encodedLength = this.encodeLength(encodedValue.length);
    chunks.push(encodedValue);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + encodedValue.length;
  };

  webm.Encoder.prototype.encodeFloat32Chunk = function(id, value, chunks) {
    var encodedID = this.encodeID(id);
    var encodedValue = this.encodeFloat32(value);
    var encodedLength = this.encodeLength(encodedValue.length);
    chunks.push(encodedValue);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + encodedValue.length;
  };

  webm.Encoder.prototype.encodeFloat64Chunk = function(id, value, chunks) {
    var encodedID = this.encodeID(id);
    var encodedValue = this.encodeFloat64(value);
    var encodedLength = this.encodeLength(encodedValue.length);
    chunks.push(encodedValue);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + encodedValue.length;
  };

  webm.Encoder.prototype.encodeStringChunk = function(id, value, chunks) {
    var encodedID = this.encodeID(id);
    var encodedValue = this.encodeString(value);
    var encodedLength = this.encodeLength(encodedValue.length);
    chunks.push(encodedValue);
    chunks.push(encodedLength);
    chunks.push(encodedID);
    return encodedID.length + encodedLength.length + encodedValue.length;
  };

  webm.Encoder.prototype.encodeEBML = function(chunks) {
    var len = 0;
    len += this.encodeUintChunk('DocTypeReadVersion', 2, chunks);
    len += this.encodeUintChunk('DocTypeVersion', 2, chunks);
    len += this.encodeStringChunk('DocType', 'webm', chunks);
    len += this.encodeUintChunk('EBMLMaxSizeLength', 8, chunks);
    len += this.encodeUintChunk('EBMLMaxIDLength', 4, chunks);
    len += this.encodeUintChunk('EBMLReadVersion', 1, chunks);
    len += this.encodeUintChunk('EBMLVersion', 1, chunks);
    return this.encodeDataChunk('EBML', len, chunks);
  };

  webm.Encoder.prototype.encodeSegmentInfo = function(duration, title, chunks) {
    var len = 0;
    len += this.encodeStringChunk('WritingApp', 'stop-motion', chunks);
    len += this.encodeStringChunk('MuxingApp', 'stop-motion', chunks);
    if (title)
      len += this.encodeStringChunk('Title', title, chunks);
    len += this.encodeUintChunk('TimecodeScale', 1000000, chunks);
    len += this.encodeFloat64Chunk('Duration', duration, chunks);
    return this.encodeDataChunk('Info', len, chunks);
  };

  webm.Encoder.prototype.encodeVideoTrackEntry = function(num, uid, w, h, chunks) {
    var len = 0;
    len += this.encodeUintChunk('PixelWidth', w, chunks);
    len += this.encodeUintChunk('PixelHeight', h, chunks);
    len += this.encodeUintChunk('FlagInterlaced', 0, chunks);
    len = this.encodeDataChunk('Video', len, chunks);

    len += this.encodeStringChunk('CodecID', 'V_VP8', chunks);
    len += this.encodeStringChunk('CodecName', 'VP8', chunks);
    len += this.encodeUintChunk('FlagLacing', 0, chunks);
    len += this.encodeUintChunk('FlagDefault', 1, chunks);
    len += this.encodeUintChunk('FlagEnabled', 1, chunks);
    len += this.encodeUintChunk('FlagForced', 1, chunks);
    len += this.encodeUintChunk('TrackType', 1, chunks);
    len += this.encodeUintChunk('TrackUID', uid, chunks);
    len += this.encodeUintChunk('TrackNumber', num, chunks);
    return this.encodeDataChunk('TrackEntry', len, chunks);
  };

  webm.Encoder.prototype.encodeCuePoint = function(timeCode, track, position, chunks) {
    var len = 0;
    len += this.encodeUintChunk('CueClusterPosition', position, chunks);
    len += this.encodeUintChunk('CueTrack', track, chunks);
    len = this.encodeDataChunk('CueTrackPositions', len, chunks);
    len += this.encodeUintChunk('CueTime', timeCode, chunks);
    return this.encodeDataChunk('CuePoint', len, chunks);
  };

  webm.Encoder.prototype.encodeVideoFrame = function(timeCode, track, vp8, chunks) {
    var encodedFlags = webm.Encoder.encodeUint(0x80);  // Cluster contains keyframes only
    var encodedTimeCode = this.encodeInt(timeCode, 2);
    var encodedTrackNum = this.encodeLength(track);
    chunks.push(vp8);
    chunks.push(encodedFlags);
    chunks.push(encodedTimeCode);
    chunks.push(encodedTrackNum);
    return vp8.length + encodedFlags.length + encodedTimeCode.length + encodedTrackNum.length;
  };

  webm.Encoder.prototype.encode = function(title, w, h, frameDuration, frameCount, getFrameFunction) {
    frameDuration = Math.round(frameDuration);
    var framesPerCluster = Math.floor(32000 / frameDuration);
    var clusterCount = Math.ceil(frameCount / framesPerCluster);
    var segmentDuration = frameDuration * frameCount;
    var segmentLength = 0;
    var videoTrackNum = 1;
    var videoTrackUid = 1;

    var infoChunks = [];
    segmentLength += this.encodeSegmentInfo(segmentDuration, title, infoChunks);

    var tracksChunks = [];
    segmentLength += this.encodeDataChunk(
	'Tracks',
	this.encodeVideoTrackEntry(videoTrackNum, videoTrackUid, w, h, tracksChunks),
	tracksChunks);

    var cueChunks = [];
    var clusterChunks = [];
    var clusterOffset = segmentLength;
    for (var i = 0; i < clusterCount; i++) {
      var clusterStart = i * framesPerCluster * frameDuration;
      var chunks = [];
      segmentLength += this.encodeCuePoint(clusterStart, videoTrackNum, clusterOffset, chunks);
      cueChunks = chunks.concat(cueChunks);

      chunks = [];
      var len = 0;
      var firstFrame = i * framesPerCluster;
      var lastFrame = Math.min((i + 1) * framesPerCluster, frameCount);
      for (var j = firstFrame; j < lastFrame; j++) {
	len += this.encodeVideoFrame((j - firstFrame) * frameDuration, videoTrackNum, getFrameFunction(j), chunks);
      }
      len += this.encodeUintChunk('Timecode', clusterStart, chunks);
      clusterOffset += this.encodeDataChunk('Cluster', len, chunks);
      clusterChunks = chunks.concat(clusterChunks);
    }
    segmentLength += clusterOffset;

    var chunks = [].concat(cueChunks, clusterChunks, tracksChunks, infoChunks);
    this.encodeDataChunk('Segment', segmentLength, chunks);
    this.encodeEBML(chunks);
    chunks.reverse();
    return new Blob(chunks, {type: "video/webm"});
  };

  webm.Decoder = function() {
    this.idx = -1;
  };

  webm.Decoder.prototype.decodeID = function(data) {
    var idx = this.idx;
    if (data[idx] & 0x80) {
      this.idx += 1;
      return webm.ID_NAMES[data[idx]];
    } else if (data[idx] & 0x40) {
      this.idx += 2;
      return webm.ID_NAMES[(data[idx] << 8) | data[idx+1]];
    } else if (data[idx] & 0x20) {
      this.idx += 3;
      return webm.ID_NAMES[(data[idx] << 16) | (data[idx+1] << 8) | data[idx+2]];
    } else if (data[idx] & 0x10) {
      this.idx += 4;
      return webm.ID_NAMES[(data[idx] << 24) | (data[idx+1] << 16) | (data[idx+2] << 8) | data[idx+3]];
    }
    throw ('Mal-formed ID field at position ' + idx);
  };

  webm.Decoder.prototype.decodeLength = function(data) {
    var idx = this.idx;
    if (data[idx] & 0x80) {
      this.idx += 1;
      return data[idx] & 0x7f;
    } else if (data[idx] & 0x40) {
      this.idx += 2;
      return ((data[idx] & 0x3f) << 8) | data[idx+1];
    } else if (data[idx] & 0x20) {
      this.idx += 3;
      return ((data[idx] & 0x1f) << 16) | (data[idx+1] << 8) | data[idx+2];
    } else if (data[idx] & 0x10) {
      this.idx += 4;
      return ((data[idx] & 0xf) << 24) | (data[idx+1] << 16) | (data[idx+2] << 8) | data[idx+3];
    } else if (data[idx] & 0x8) {
      this.idx += 5;
      return (((data[idx] & 0x7) * 0x100000000) +
              ((data[idx+1] << 24) | (data[idx+2] << 16) | (data[idx+3] << 8) | data[idx+4]));
    } else if (data[idx] & 0x4) {
      this.idx += 6;
      return (((data[idx] & 0x3) * 0x10000000000) +
              (data[idx+1] * 0x100000000) +
              ((data[idx+2] << 24) | (data[idx+3] << 16) | (data[idx+4] << 8) | data[idx+5]));
    } else if (data[idx] & 0x2) {
      this.idx += 7;
      return (((data[idx] & 0x1) * 0x1000000000000) +
              (data[idx+2] * 0x10000000000) +
              (data[idx+2] * 0x100000000) +
              ((data[idx+3] << 24) | (data[idx+4] << 16) | (data[idx+5] << 8) | data[idx+6]));
    } else if (data[idx] & 0x1) {
      this.idx += 8;
      return ((data[idx+1] * 0x1000000000000) +
              (data[idx+2] * 0x10000000000) +
              (data[idx+3] * 0x100000000) +
              ((data[idx+4] << 24) | (data[idx+5] << 16) | (data[idx+6] << 8) | data[idx+7]));
    } else {
      // throw
    }

  };
})();
