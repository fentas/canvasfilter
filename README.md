# canvasfilter.js
Mainly this library extends the canvas context object (CanvasRenderingContext2D)
with image processing filters. It aims to make it easy and strait forward to
use.

### Inspired by - Based on
https://github.com/kig/canvasfilters

http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

Big thanks for that.

## Current State
A lot of filters should be working fine. A couple are missing, though.
Like [Sobel filter](http://en.wikipedia.org/wiki/Sobel_filter). Due to the
Float32 problematic.
> Note that ImageData values are clamped between 0 and 255, so we need
> to use a Float32Array for the gradient values because they
> range between -255 and 255.

### Browser support
For the main part it should be working in browsers supporting canvas.

http://caniuse.com/#search=canvas

Personally I tested it on FireFox (31) and Chrome (37 ~ beta).

## Planed in near future
1. Setting up test environment. (e.g. travis-ci, browser testing etc.)
2. Create examples and demo page.
3. Of course bug fixing, improvements and extending.
4. Maybe make it ready for nodejs environment.

## Getting Started
Just download and use it. Or you can use bower.
```shell
bower install fentas/canvasfilter
```

Last step is to insert it into your website/app.
```html
<script src="path/to/canvasfilter/canvasfilter.js"></script>
```

## Usage
As said before the library tries to make it simple as possible.
For starters one example.
```html
<img src="/picture.jpg">
<script>
// turns into canvas object
var ctx = document.querySelector('img').toCanvas().getContext('2d');
// applies grayscale filter and flips the image vertically
ctx.filter.grayscale().flipVertical();
// and for convenience turn it into an image again
ctx.canvas.toImage();
</script>
```

### CanvasFilter methods
All the filters are found within _filter_ attribute (in
`CanvasRenderingContext2D` object)
```js
var ctx = canvas.getContext('2d');
ctx.filter // << here is the image processing collection. ~ CanvasFilter
```

#### Image processing filters
- `CanvasFilter *.flipHorizontal()`

> Flips the image horizontally.
- `CanvasFilter *.flipVertical()`

> Flips the image vertically.
  - subtest
  
  > test test

#### The rest
- `ImageData *.getPixels()`

Returns simply the complete image data of the canvas object.
- `*.getBilinearSample(x, y, px)`

http://en.wikipedia.org/wiki/Bilinear_filtering

### Other useful extensions
There are some extension to some of the HTML dom objects to make the
workflow more convenient.

#### `HTMLImageElement`
- `HTMLCanvasElement *.toCanvas([keep])`

Converts _img_ to _canvas_ with the image data.
  - `keep` _default: false_

  If *true* img tag will not be replace instead it just returns the canvas
  tag/object.

#### `HTMLCanvasElement`
- `HTMLImageElement *.toImage([keep], [type], [args])`

Converts _canvas_ to _image_ with canvas image data. Basically it uses canvas
image data url.
  - `keep` _default: false_

  If *true* canvas tag will not be replaced instead it just returns the img
  tag/object
  - `type` _default: image/png_

  More information about this.
  [toDataURL](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)

#### `CanvasRenderingContext2D`
- `CanvasRenderingContext2D *.clone()`

Clones the given canvas context. E.g. nice to have for blending methods.
```js
var ctx = document.querySelector('img').toCanvas().getContext('2d');
// applies grayscale filter and flips the image vertically
canvas.filter.blend(ctx.clone().filter.grayscale().flipVertical()).darken();
```

- `CanvasRenderingContext2D *.restore()`

Restores the image data to its original data.

## Donation
Please help me to finance my every cup of tea. Every coin is appreciated.

```
Sick of tea? That’s like being sick of *breathing*! - Uncle Iroh
```

Bitcoin address: `197EypPopXtDPFK6rEbCw6XDEaxjTKP58S`

PayPal: `jan.guth@gmail.com`

Or just `flattr` this repo.
