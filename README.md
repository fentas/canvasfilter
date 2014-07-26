[![Build Status](https://travis-ci.org/fentas/canvasfilter.svg?branch=master)](https://travis-ci.org/fentas/canvasfilter)

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
- [x] Setting up test environment. (e.g. travis-ci, browser testing etc.)
  - [ ] complete all test cases (/test/*.test.js)
- [ ] Create examples and demo page.
- [ ] Of course bug fixing, improvements and extending.
- [ ] Maybe make it ready for nodejs environment.

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

###### Image processing filters.
- `CanvasFilter *.flipHorizontal()`

> Flips the image horizontally.

- `CanvasFilter *.flipVertical()`

> Flips the image vertically.

- `CanvasFilter *.luminance()`
- `CanvasFilter *.grayscale()`
- `CanvasFilter *.grayscaleAvg()`
- `CanvasFilter *.threshold(threshold, high, low)`
- `CanvasFilter *.invert()`
- `CanvasFilter *.erode()`
- `CanvasFilter *.distortSine()`

> Not working right now. (Performance issue?)

###### Convolution. [?](http://en.wikipedia.org/wiki/Convolution)
- `CanvasFilter *.convolve(weightsVector, opaque)`
- `CanvasFilter *.convolveVertical(weightsVector, opaque)`
- `CanvasFilter *.convolveHorizontal(weightsVector, opaque)`
- `CanvasFilter *.laplace()`

> This method simply applies the following matrix.
```Matlab
[-1,-1,-1,
 -1, 8,-1,
 -1,-1,-1]
```

- `CanvasFilter *.gaussianBlur()`

###### Blending methods.
This enables you to blend two or more images together.
First call `*.blend(object[, above])`.

`object`

> Any image object like
> * HTMLImageElement
> * HTMLCanvasElement
> * CanvasRenderingContext2D
> * CanvasFilter

`above` _default: false_

> Whether the given image should be above or below of the other image.

One example for this:
```js
var ctx = canvas.getContext('2d');
ctx.filter.blend(document.querySelector('img')).sub();
```

- `CanvasFilter *.blend([...]).darken()`
- `CanvasFilter *.blend([...]).lighten()`
- `CanvasFilter *.blend([...]).multiply()`
- `CanvasFilter *.blend([...]).screen()`
- `CanvasFilter *.blend([...]).add()`
- `CanvasFilter *.blend([...]).sub()`
- `CanvasFilter *.blend([...]).difference()`

###### Look Up Table (LUT). [?](http://microscopy.berkeley.edu/courses/dib/sections/03IPII/)
This gives the functionality to use LUTs. For this there exists a separate
object - `LookUpTable`. In order to work with this following method is given.

- `LookUpTable *.lookUpTable()`

The LookUpTable object consists of predefined methods and 4 different matrices.
Each for every color plus one for alpha (r,g,b and a).

The predefined methods will set all matrices to perform as described:

- `LookUpTable [LookUpTable].invert()`
- `LookUpTable [LookUpTable].brightnessContrast(brightness, contrast)`
- `CanvasRenderingContext2D [LookUpTable].apply()`

> This method will apply all matrices to the given image and return the canvas
> context (CanvasRenderingContext2D).

Now there is also the possibility to set each matrix itself. Each matrix can
be access simply like this `ColorMap [LookUpTable].a` for example. This will return
a ColorMap object which is basically a array/vector (of 255 values).
You can set each value as you like (e.g. `[LookUpTable].a[42] = 13;`) or use
the following methods:

- `LookUpTable [ColorMap].identity()` _is default_
- `LookUpTable [ColorMap].invert()`
- `LookUpTable [ColorMap].brightnessContrast(brightness, contrast)`

At last another example, inverting the green spectrum and applying the result:
```js
var ctx = canvas.getContext('2d'),
    lut = ctx.filter.lookUpTable();

lut.g.invert().apply()
//btw. you could resume the chain like: *.filter.flipVertical()
```

#### The rest
- `ImageData *.getPixels()`

> Returns simply the complete image data of the canvas object.

- `*.getBilinearSample(x, y, px)`

> More info: http://en.wikipedia.org/wiki/Bilinear_filtering

### Other useful extensions
There are some extension to some of the HTML dom objects to make the
workflow more convenient.

#### HTMLImageElement
- `HTMLCanvasElement *.toCanvas([keep])`

> Converts _img_ to _canvas_ with the image data.

  `keep` _default: false_

  > If *true* img tag will not be replace instead it just returns the canvas
  > tag/object.

#### HTMLCanvasElement
- `HTMLImageElement *.toImage([keep], [type], [args])`

> Converts _canvas_ to _image_ with canvas image data. Basically it uses canvas
> image data url.

  `keep` _default: false_

  > If *true* canvas tag will not be replaced instead it just returns the img
  > tag/object

  `type` _default: image/png_

  > More info:
  > https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement#toDataURL

#### CanvasRenderingContext2D
- `CanvasRenderingContext2D *.clone()`

> Clones the given canvas context. E.g. nice to have for blending methods.
```js
var ctx = document.querySelector('img').toCanvas().getContext('2d');
// applies grayscale filter and flips the image vertically
canvas.filter.blend(ctx.clone().filter.grayscale().flipVertical()).darken();
```

- `CanvasRenderingContext2D *.restore()`

> Restores the image data to its original data.

## Side notes
If you plan to tinker around with images stored somewhere other then your server
be aware that this could resolve into following error:

> SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.

If you have access to this particular server you could solve this
[like this](http://stackoverflow.com/questions/9972049/cross-origin-data-in-html5-canvas).

## Donations
Please help me to finance my every cup of tea. Every coin is appreciated.

```
Sick of tea? That’s like being sick of *breathing*! - Uncle Iroh
```

Bitcoin address: `197EypPopXtDPFK6rEbCw6XDEaxjTKP58S`

PayPal: `jan.guth@gmail.com`

[Or just `flattr`  me.](https://flattr.com/submit/auto?user_id=jguth&url=https://github.com/fentas)
