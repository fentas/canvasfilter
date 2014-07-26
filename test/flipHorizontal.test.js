
QUnit.test( "*.flipHorizontal()", function( assert ) {
  var canvas = assert.data.ctx.canvas;
  assert.pixelEqual(canvas, 170, 200, 235, 235, 235, 255, 'before: pixel left.');
  assert.pixelEqual(canvas, 340, 200, 255, 255, 255, 255, 'before: pixel right.');

  assert.data.ctx.filter.flipHorizontal();
  assert.pixelEqual(canvas, 170, 200, 255, 255, 255, 255, 'after: pixel left.');
  assert.pixelEqual(canvas, 340, 200, 235, 235, 235, 255, 'after: pixel right.');
});
