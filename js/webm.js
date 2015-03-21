// -*- mode: javascript; js-indent-level: 2 -*-
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
    return c.length;
  };

  webm.Encoder.prototype.encodeUint = function(n) {
    if (n < 0)
      throw ('Cannot encode ' + n + ' as a uint.');
    if (n == 0)
      return 0;

    // Make the common case fast.
    if (n <= 0xffffffff) {
      var arr = [];
      while (n) {
        arr.push(n & 0xff);
        n = n >>> 8;
      }
      return this.addChunk(new Uint8Array(arr.reverse()));
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

    return this.addChunk(arr);
  };

  webm.Encoder.prototype.encodeInt = function(n) {
    if (n == 0)
      return 0;

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
      return this.addChunk(new Uint8Array(arr.reverse()));
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
    return this.addChunk(new Uint8Array(arr.reverse()));
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
    } else if (l < 0x7ffffffff) {
      arr.push(0x8);
      arr.push((l >> 24) & 0xff);
      arr.push((l >> 16) & 0xff);
      arr.push((l >> 8) &0xff);
      arr.push(l & 0xff);
    }
  };

})();
