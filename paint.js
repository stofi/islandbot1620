
const Map = require('./map.js')
const chroma = require("chroma-js")

function degToRad(deg) {
  return (Math.PI / 180) * deg;
}

function getColor(z, palette) {
  // this is ugly :(

  var color = null;

  if (z != null && z > 0) {
    color = palette[z - 1];
  } else {
    color = '#273ecc';
  }
  return color;
}

function f(n) {
  return (n.toFixed(2) + '').padStart(10, ' ')
}

function paintObject(hex, context, options = {}) {
  options = {
    size: 0.9,
    width: 1440,
    palette: [],
    ...options
  }
  let unit = options.size


  context.save();

  context.moveTo(options.width / 2, options.width / 2)
  context.translate(hex.x, hex.y)

  let color = getColor(hex.z, options.palette)

  context.beginPath();

  let size = unit * 1.02; // slightly increase the size, cleans rounding artifacts
  let angle;

  angle = degToRad(90); // start at 90deg

  context.moveTo(size * Math.cos(angle), size * Math.sin(angle));
  for (var i = 1; i < 7; i++) {
    // rotate by 60deg
    angle = degToRad(60 * i + 30);
    context.lineTo(size * Math.cos(angle), size * Math.sin(angle));
  }
  context.closePath();

  context.fillStyle = color;

  if (false) {
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.stroke()
    context.font = size * 0.7 + 'px Helvetica'
    context.fillText(hex.z, -size / 4, size / 2)
    // context.fillText(hex.z,-size/4,size/2)
  } else {
    context.fill();

  }
  context.restore();
}

function paint(canvas, options = {}) {
  var map = new Map(options.RADIUS, options.WIDTH, options.WIDTH, options.SIZE, options.MAX_ELEVATION, options.RANDOMNESS, options.ELEVATION_STEP);

  map.addNRandomPeaks(options.PEAKS);
  map.elevateAll();
  let map_data = map.draw()

  // console.log(map_data.filter(i=>i.z!=0));


  const palette = chroma.scale(["14640a", "fbf84f", "6b030a"]).colors(options.MAX_ELEVATION)

  const context = canvas.getContext("2d");
  context.rect(0, 0, context.canvas.width, context.canvas.height)
  context.fillStyle = '#273ecc'
  context.fill()

  let hexOptions = {
    size: options.SIZE,
    width: options.WIDTH,
    palette,
  }
  map_data.forEach(o => {
    if (o.type === 'hex') {
      paintObject(o, context, hexOptions)
    }
  })
}

module.exports = paint
