
QUnit.test( '*.flipVertical()', function( assert ) {
  var canvas = assert.data.ctx.canvas;
  assert.pixelEqual(canvas, 170, 200, 235, 235, 235, 255, 'before: pixel top.');
  assert.pixelEqual(canvas, 170, 450, 228,  77,  38, 255, 'before: pixel bottom.');

  assert.data.ctx.filter.flipVertical();
  assert.pixelEqual(canvas, 170, 200, 235, 235, 235, 255, 'after: pixel top.');
  assert.pixelEqual(canvas, 170, 450,   0,   0,   0, 255, 'after: pixel bottom.');
});
