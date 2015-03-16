'use strict';

var webm = webm || {};

(function() {
  webm.Encoder = function() {
    this.chunks = [];
    this.byteCount = 0;
  };

  webm.Encoder.addChunk(c) {
    this.chunks.push(c);
    this.byteCount += c.length;
  };

  webm.Encoder.prototype.encodeUint = function(n) {
    if (n < 0)
      throw ('Cannot encode ' + n + ' as a uint.');

    // Make the common case fast.
    if (n <= 0xffffffff) {
      var signByte = n & 0x80000000 ? 1 : 0;
      var arr = new Uint8Array(4 + signByte);
      if (signByte)
        arr[0] = 0;
      arr[0 + signByte] = (n >> 24) & 0xff;
      arr[1 + signByte] = (n >> 16) & 0xff;
      arr[2 + signByte] = (n >> 8) & 0xff;
      arr[3 + signByte] = n & 0xff;
      return arr;
    }

    var fb = new Uint8Array(new Float64Array([n]).buffer);
    var exponent = (((fb[7] & 0x7f) << 4) | ((fb[6] & 0xf0) >> 4)) - 1023;
    fb[6] = 0x10 | (fb[6] & 0xf);
    fb[7] = 0;
    var align = 7 - (exponent % 8);
    var signByte = align ? 0 : 1;
    var numBytes = Math.ceil(exponent / 8);
    var arr = new Uint8Array(numBytes + signByte);
    if (signByte)
      arr[0] = 0;
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

    return arr;
  };
})();
