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

    // simple pixel function
    // --------------------------
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
          var dOff = ( ( h - y - 1 ) * w + x ) * 4;
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
    }
    ,

    // Pixel intensity mapping, transfer functions, and the Look Up Table (LUT)
    // --------------------------
    lookUpTable: function() {
      return new LookUpTable(this._);
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

  window.canvasFilter = canvasFilter;
})();
