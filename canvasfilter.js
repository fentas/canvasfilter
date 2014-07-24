/**
* Copyright (c) 2014 everyone who cares Authors. All rights reserved.
* GPLv2 Licence.

SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.
http://stackoverflow.com/questions/9972049/cross-origin-data-in-html5-canvas
**/

(function() {

  // polyfill typed array
  // --------------------------
  if ( typeof Float32Array === 'undefined' || typeof Uint8Array === 'undefined' ) {
    //TODO: async loading good enough?
    var script = document.createElement('script');
    script.src = 'https://raw.githubusercontent.com/inexorabletash/polyfill/master/typedarray.js';
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  // canvasFilter object
  // --------------------------
  function canvasFilter(context) {
    // is initialized object?
    if ( ! ( this instanceof canvasFilter ) )
      return new canvasFilter(context);

    var context = context || document.createElement('canvas').getContext('2d');
    if ( context instanceof HTMLCanvasElement )
      context = context.getContext('2d');

    if ( ! ( context instanceof CanvasRenderingContext2D ) )
      throw Error('[canvasFilter] first argument has to be an instance of CanvasRenderingContext2D or HTMLCanvasElement');

    // set context
    this._ = context;

    // restore functionality
    var orgImageDate = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    this.restore = function () { context.putImageData(orgImageDate, 0, 0); return this; };
  }

  canvasFilter.prototype = {
    // misc
    // --------------------------
    getPixels: function() {
      return this._.getImageData(0, 0, this._.canvas.width, this._.canvas.height);
    },
    getBilinearSample: function (x, y, px) {
      var pixels = this.getPixels(),
          x1 = Math.floor(x), x2 = Math.ceil(x),
          y1 = Math.floor(y), y2 = Math.ceil(y),
          a = ( x1 + pixels.width * y1 ) * 4,
          b = ( x2 + pixels.width * y1 ) * 4,
          c = ( x1 + pixels.width * y2 ) * 4,
          d = ( x2 + pixels.width * y2 ) * 4,
          df = ((x - x1) + (y - y1)),
          cf = ((x2 - x) + (y - y1)),
          bf = ((x - x1) + (y2 - y)),
          af = ((x2 - x) + (y2 - y)),
          rsum = 1 / ( af + bf + cf + df ),
          data = pixels.data,
          rgba = px || this._.createImageData(1, 1).data;

      af *= rsum;
      bf *= rsum;
      cf *= rsum;
      df *= rsum;
      rgba[0] = data[a]*af + data[b]*bf + data[c]*cf + data[d]*df;
      rgba[1] = data[a+1]*af + data[b+1]*bf + data[c+1]*cf + data[d+1]*df;
      rgba[2] = data[a+2]*af + data[b+2]*bf + data[c+2]*cf + data[d+2]*df;
      rgba[3] = data[a+3]*af + data[b+3]*bf + data[c+3]*cf + data[d+3]*df;

      return rgba;
    },
    // simple pixel function
    // --------------------------
    /*
    identity: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data;

      for (var i = 0; i < pdata.length; i++) {
        idata[i] = pdata[i];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    */
    flipHorizontal: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          w = pixels.width, h = pixels.height,
          pdata = pixels.data,
          idata = output.data;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++) {
          var pOff = ( y * w + x ) * 4;
          var dOff = ( y * w + ( w - x - 1) ) * 4;
          idata[dOff]   = pdata[pOff];
          idata[dOff+1] = pdata[pOff+1];
          idata[dOff+2] = pdata[pOff+2];
          idata[dOff+3] = pdata[pOff+3];
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    flipVertical: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          w = pixels.width, h = pixels.height,
          pdata = pixels.data,
          idata = output.data;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var pOff = ( y * w + x ) * 4;
          var iOff = ( ( h - y - 1 ) * w + x ) * 4;
          idata[iOff]   = pdata[pOff];
          idata[iOff+1] = pdata[pOff+1];
          idata[iOff+2] = pdata[pOff+2];
          idata[iOff+3] = pdata[pOff+3];
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    luminance: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data;

      for ( var i = 0; i < pdata.length; i += 4 ) {
        var r = pdata[i];
        var g = pdata[i+1];
        var b = pdata[i+2];
        // CIE luminance for the RGB
        var v = 0.2126*r + 0.7152*g + 0.0722*b;
        idata[i]   = idata[i+1] = idata[i+2] = v;
        idata[i+3] = pdata[i+3];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    grayscale: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data;

      for ( var i = 0; i < pdata.length; i += 4) {
        var r = pdata[i];
        var g = pdata[i+1];
        var b = pdata[i+2];
        var v = 0.3*r + 0.59*g + 0.11*b;
        idata[i]   = idata[i+1] = idata[i+2] = v;
        idata[i+3] = pdata[i+3];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    grayscaleAvg: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          f = 1/3;

      for ( var i = 0; i < pdata.length; i += 4 ) {
        var r = pdata[i];
        var g = pdata[i+1];
        var b = pdata[i+2];
        var v = ( r + g + b ) * f;
        idata[i]   = idata[i+1] = idata[i+2] = v;
        idata[i+3] = pdata[i+3];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    threshold: function(pixels, threshold, high, low) {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          high = high || 255,
          low = low || 0,
          pdata = pixels.data,
          idata = output.data;

      for ( var i = 0; i < pdata.length; i += 4 ) {
        var r = pdata[i];
        var g = pdata[i+1];
        var b = pdata[i+2];
        var v = ( 0.3*r + 0.59*g + 0.11*b >= threshold ) ? high : low;
        idata[i]   = idata[i+1] = idata[i+2] = v;
        idata[i+3] = pdata[i+3];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    invert: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data;

      for ( var i=0; i < pdata.length; i += 4 ) {
        idata[i]   = 255 - pdata[i];
        idata[i+1] = 255 - pdata[i+1];
        idata[i+2] = 255 - pdata[i+2];
        idata[i+3] = pdata[i+3];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },

    // Pixel intensity mapping, transfer functions, and the Look Up Table (LUT)
    // --------------------------
    lookUpTable: function() {
      return new LookUpTable(this._);
    },

    convolve: function(weightsVector, opaque) {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          sw = pixels.width, w = sw,
          sh = pixels.height, h = sh,

          alphaFac = opaque ? 1 : 0,
          side = Math.round(Math.sqrt(weightsVector.length)),
          halfSide = Math.floor(side / 2);

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var sy = y, sx = x,
              iOff = ( y * w + x ) * 4,
              r=0, g=0, b=0, a=0;

          for ( var cy = 0; cy < side; cy++) {
            for ( var cx = 0; cx < side; cx++) {
              var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide)),
                  scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide)),
                  pOff = ( scy * sw + scx ) * 4,
                  wt = weightsVector[cy * side + cx];

              r += pdata[pOff] * wt;
              g += pdata[pOff+1] * wt;
              b += pdata[pOff+2] * wt;
              a += pdata[pOff+3] * wt;
            }
          }
          idata[iOff] = r;
          idata[iOff+1] = g;
          idata[iOff+2] = b;
          idata[iOff+3] = a + alphaFac * ( 255 - a );
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    convolveVertical: function(weightsVector, opaque) {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          sw = pixels.width, w = sw,
          sh = pixels.height, h = sh,

          side = weightsVector.length,
          halfSide = Math.floor(side / 2),
          alphaFac = opaque ? 1 : 0;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var sy = y, sx = x,
              iOff = ( y * w + x ) * 4,
              r=0, g=0, b=0, a=0;

          for ( var cy = 0; cy < side; cy++ ) {
            var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide)),
                scx = sx,
                pOff = ( scy * sw + scx ) * 4,
                wt = weightsVector[cy];

            r += pdata[pOff] * wt;
            g += pdata[pOff+1] * wt;
            b += pdata[pOff+2] * wt;
            a += pdata[pOff+3] * wt;
          }
          idata[iOff] = r;
          idata[iOff+1] = g;
          idata[iOff+2] = b;
          idata[iOff+3] = a + alphaFac * ( 255 - a );
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    convolveHorizontal: function(weightsVector, opaque) {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          sw = pixels.width, w = sw,
          sh = pixels.height, h = sh,

          side = weightsVector.length,
          halfSide = Math.floor(side/2),
          alphaFac = opaque ? 1 : 0;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var sy = y, sx = x,
              iOff = ( y * w + x ) * 4,
              r=0, g=0, b=0, a=0;

          for ( var cx = 0; cx < side; cx++ ) {
            var scy = sy,
                scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide)),
                pOff = (scy * sw + scx ) * 4,
                wt = weightsVector[cx];

            r += pdata[pOff] * wt;
            g += pdata[pOff+1] * wt;
            b += pdata[pOff+2] * wt;
            a += pdata[pOff+3] * wt;
          }
          idata[iOff] = r;
          idata[iOff+1] = g;
          idata[iOff+2] = b;
          idata[iOff+3] = a + alphaFac * ( 255 - a );
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    laplace: function() {
      return this.convolve(
        [-1,-1,-1,
         -1, 8,-1,
         -1,-1,-1], true);
    },
    //TODO: Float32Array topic...
    /*
    convolveFloat32: function(weightsVector, opaque) {
      var pixels = this.getPixels(),
          output = new Float32Array(pixels.width * pixels.height * 4);//this._.createImageData(pixels.width, pixels.height).toFloat32Array(),
          pdata = pixels.data,
          idata = output.data,
          sw = pixels.width, w = sw,
          sh = pixels.height, h = sh,

          side = Math.round(Math.sqrt(weightsVector.length)),
          halfSide = Math.floor(side / 2),
          alphaFac = opaque ? 1 : 0;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var sy = y, sx = x,
              iOff = ( y * w + x ) * 4,
              r=0, g=0, b=0, a=0;

          for ( var cy = 0; cy < side; cy++ ) {
            for ( var cx = 0; cx < side; cx++ ) {
              var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
              var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
              var pOff = ( scy * sw + scx ) * 4;
              var wt = weightsVector[cy * side + cx];
              r += pdata[pOff] * wt;
              g += pdata[pOff+1] * wt;
              b += pdata[pOff+2] * wt;
              a += pdata[pOff+3] * wt;
            }
          }
          idata[iOff] = r;
          idata[iOff+1] = g;
          idata[iOff+2] = b;
          idata[iOff+3] = a + alphaFac * ( 255 - a );
        }
      }
console.info(output)
      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    }
    */
    gaussianBlur: function(diameter) {
      var diameter = Math.abs(diameter || 10);

      if (diameter <= 1)
        return this;
      //  return this.identity();

      var pixels = this.getPixels(),
          radius = diameter / 2;
          len = Math.ceil(diameter) + ( 1 - ( Math.ceil(diameter) % 2 ) ),
          weights = new Float32Array(len),// this.getFloat32Array(len),
          rho = ( radius + 0.5 ) / 3,
          rhoSq = rho * rho,
          gaussianFactor = 1 / Math.sqrt(2 * Math.PI * rhoSq),
          rhoFactor = -1 / ( 2 * rho * rho ),
          wsum = 0,
          middle = Math.floor(len / 2);

      for ( var i = 0; i < len; i++ ) {
        var x = i - middle,
            gx = gaussianFactor * Math.exp(x * x * rhoFactor);

        weights[i] = gx;
        wsum += gx;
      }
      for ( var i = 0; i < weights.length; i++) {
        weights[i] /= wsum;
      }
      //return Filters.separableConvolve(pixels, weights, weights, false);
      this.convolveVertical(weights).convolveHorizontal(weights);
      return this;
    },
    distortSine: function(amount, yamount) {
      //TODO: performance issue...
      return;
      var amount = amount || 0.5,
          yamount = yamount || amount,

          pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          idata = output.data,

          px = this._.createImageData(1, 1).data;

      for ( var y = 0; y < output.height; y++ ) {
        var sy = -Math.sin(y / ( output.height - 1 ) * Math.PI * 2),
            srcY = y + sy * yamount * output.height / 4;

        srcY = Math.max(Math.min(srcY, output.height - 1), 0);

        for (var x = 0; x < output.width; x++) {
          var sx = -Math.sin(x / (output.width - 1) * Math.PI * 2),
              srcX = x + sx * amount * output.width / 4;

          srcX = Math.max(Math.min(srcX, output.width - 1), 0);

          var rgba = this.getBilinearSample(srcX, srcY, px);

          var off = ( y * output.width + x ) * 4;
          idata[off] = rgba[0];
          idata[off+1] = rgba[1];
          idata[off+2] = rgba[2];
          idata[off+3] = rgba[3];
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    },
    erode: function() {
      var pixels = this.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          sw = pixels.width, w = sw,
          sh = pixels.height, h = sh;

      for ( var y = 0; y < h; y++ ) {
        for ( var x = 0; x < w; x++ ) {
          var sy = y, sx = x, v = 0,
              dstOff = ( y * w + x ) * 4,
              srcOff = ( sy * sw + sx ) * 4;

          if ( pdata[srcOff] == 0 ) {
            if ( pdata[(sy*sw+Math.max(0,sx-1))*4] == 0 &&
                 pdata[(Math.max(0,sy-1)*sw+sx)*4] == 0) {
              v = 255;
            }
          } else {
              v = 255;
          }
          idata[dstOff] = v;
          idata[dstOff+1] = v;
          idata[dstOff+2] = v;
          idata[dstOff+3] = 255;
        }
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this;
    }
  };

  // global stuff
  // --------------------------

  function ColorMap(parent) {
    if ( ! ( parent instanceof LookUpTable ) )
      throw Error('[ColorMap] first argument has to be an instance of LookUpTable');

    // make sure this is an instance of LookUpTable (call without new)
    if ( ! ( this instanceof ColorMap ) )
      return new ColorMap(parent);

    //@deprecated
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
    //TODO: how to solve differently?
    //TODO: this.length ~ TypeError: Method Uint8Array.length called on incompatible receiver #<Uint8Array> [this.__proto__.length ...]
    //this.__proto__ = new Uint8Array(256);
    Object.setPrototypeOf(this, new Uint8Array(256));
    var _this = this;
    Object.defineProperty(this, "length", {
      get: function() { return _this.__proto__.length; },
      writeable: false,
      readable: true,
      enumerable: true
    });
    //TODO: not working...
    this.set = function() { this.__proto__.set.apply(this.__proto__, arguments); return this.parent; };

    //TypeError: Constructor Uint8Array requires 'new'
    //Uint8Arra.apply(this, arguments);

    Object.defineProperty(this, "parent", {
      value: parent,
      writeable: false,
      readable: true,
      enumerable: true
    });

    this.identity = function() {
      for ( var i = 0; i< this.length; i++ ) {
        this[i] = i;
      }
      return this.parent;
    };
    this.invert = function() {
      for ( var i = 0; i < this.length; i++ ) {
        this[i] = 255 - i;
      }
      return this.parent;
    };
    this.brightnessContrast = function(brightness, contrast) {
      var contrastAdjust = -128 * contrast + 128;
      var brightnessAdjust = 255 * brightness;
      var adjust = contrastAdjust + brightnessAdjust;
      for ( var i = 0; i < this.length; i++ ) {
        var c = i * contrast + adjust;
        this[i] = c < 0 ? 0 : ( c > 255 ? 255 : c );
      }
      return this.parent;
    };

    // set default: identity verctor
    this.identity();
  }
  //TODO: polyfill fast enough?!
  ColorMap.prototype = Object.create(Uint8Array.prototype);

  // custom array for Look Up Table
  function LookUpTable(context) {
    if ( ! ( context instanceof CanvasRenderingContext2D ) )
      throw Error('[canvasFilter] first argument has to be an instance of CanvasRenderingContext2D');

    // make sure this is an instance of LookUpTable (call without new)
    if ( ! ( this instanceof LookUpTable ) )
      return new LookUpTable(context);


    var r = new ColorMap(this), g = new ColorMap(this), b = new ColorMap(this), a = new ColorMap(this);

    //TypeError: Constructor Uint8Array requires 'new'
    //Uint8Arra.apply(this, arguments);

    Object.defineProperty(this, "_", {
      value: context,
      writeable: false,
      readable: true,
      enumerable: true
    });
    Object.defineProperty(this, "r", {
      get: function() { return r; },
      set: function(value) { if ( value instanceof ColorMap ) r = value; },
      enumerable: true
    });
    Object.defineProperty(this, "g", {
      get: function() { return g; },
      set: function(value) { if ( value instanceof ColorMap ) g = value; },
      enumerable: true
    });
    Object.defineProperty(this, "b", {
      get: function() { return r; },
      set: function(value) { if ( value instanceof ColorMap ) b = value; },
      enumerable: true
    });
    Object.defineProperty(this, "a", {
      get: function() { return a; },
      set: function(value) { if ( value instanceof ColorMap ) a = value; },
      enumerable: true
    });

    this.apply = function() {
      var pixels = this._.filter.getPixels(),
          output = this._.createImageData(pixels.width, pixels.height),
          pdata = pixels.data,
          idata = output.data,
          r = this.r, g = this.g, b = this.b, a = this.a;

      for ( var i = 0; i < pdata.length; i += 4) {
        idata[i]   = r[pdata[i]];
        idata[i+1] = g[pdata[i+1]];
        idata[i+2] = b[pdata[i+2]];
        idata[i+3] = a[pdata[i+3]];
      }

      this._.putImageData(output, 0, 0);
      // return output?
      return this._;
    };

    // global LUT functions
    // --------------------------
    this.brightnessContrast = function(brightness, contrast) {
      return this.r.brightnessContrast(brightness, contrast)
                 .g.brightnessContrast(brightness, contrast) //TODO: ugly. maybe: [...].set(this.r)
                 .b.brightnessContrast(brightness, contrast)
                 .a.identity();
    };
    this.invert = function() {
      return this.r.invert()
                 .g.invert()
                 .b.invert()
                 .a.identity();
    };
  }
  //window.LookUpTable = LookUpTable;

  HTMLCanvasElement.prototype.getContext = (function(_super) {
    return function() {
      var context = _super.apply(this, arguments);
      context.filter = new canvasFilter(context);

      return context;
    };
  })(HTMLCanvasElement.prototype.getContext);

  // replace image tag (img) with canvas and draw current image
  // note: security issue - if you have no right to access image
  HTMLImageElement.prototype.toCanvas = function(keep) {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.getContext('2d').drawImage(this, 0, 0);

    // if there is no parent (DOM) there is nothing to replace
    if ( keep || this.parentElement === null ) {
      return canvas;
    }
    this.parentElement.replaceChild(canvas, this);
    return canvas;
  }

  /*
  ImageData.prototype.toFloat32Array = function() {
    var f32a = new Float32Array(this.width * this.height * 4);
    // overwrite data attribute
    Object.defineProperty(this, 'data', {
      get: function() { return f32a; }
    });
    return this;
  }

  // store last image data written to canvas
  CanvasRenderingContext2D.prototype.putImageData = (function(_super) {
    return function(imageData) {
      _super.apply(this, arguments);
      this.lastImageData = this;
    };
  })(CanvasRenderingContext2D.prototype.putImageData);
  */

  window.canvasFilter = canvasFilter;
})();
