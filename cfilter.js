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

  // construct
  // --------------------------
  function cfilter(context) {
    // is initialized object?
    if ( ! this instanceof cfilter )
      return new cfilter(context);

    var context = context || document.createElement('canvas').getContext('2d');
    if ( context instanceof HTMLCanvasElement )
      context = context.getContext('2d');

    if ( ! context instanceof CanvasRenderingContext2D )
      throw Error('[cfilter] first argument has to be an instance of CanvasRenderingContext2D or HTMLCanvasElement');

    // set context
    this._ = context;
  }

  // private
  // --------------------------


  // public
  // --------------------------
  cfilter.prototype = {
    getPixels: function() {
      return this._.getImageData(0, 0, this._.canvas.width, this._.canvas.height);
    },
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
      return output;
    }
  };

  // global stuff
  // --------------------------
  HTMLCanvasElement.prototype.getContext = (function(_super) {
    return function() {
      var context = _super.apply(this, arguments);
      context.filter = new cfilter(context);

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

})();
