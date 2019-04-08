const FB = require('fb')
const fs = require('fs')
const seedrandom = require("seedrandom")
const { createCanvas } = require("canvas")
const nameGenerator = require('./namegenerator.js')
const Map = require('./map.js')
const paint = require('./paint.js')

const {FACEBOOK_ACCESS_TOKEN} = require('./private.json')

FB.setAccessToken(FACEBOOK_ACCESS_TOKEN)

const SEED = nameGenerator()

seedrandom(SEED, { global: true })

const RADIUS = 21, SIZE = 20, PEAKS = 3, WIDTH = 1440, MAX_ELEVATION = 512
const canvas = createCanvas(WIDTH, WIDTH, {pixelFormat: "RGB16_565"})

const ctx = canvas.getContext("2d");
var map = new Map(RADIUS, WIDTH, WIDTH, SIZE, MAX_ELEVATION);

map.addNRandomPeaks(PEAKS);
map.elevateAll();


const chroma = require("chroma-js")
const PALETTE = chroma.scale(["14640a", "fbf84f", "6b030a"]).colors(MAX_ELEVATION)

ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
ctx.fillStyle = '#273ecc'
ctx.fill()

paint(map.draw(), {
  hex(hex) {
    let unit = SIZE
    let context = ctx

    function degToRad(deg) {
      return (Math.PI / 180) * deg;
    }
    function getColor(z) {
      // this is ugly :(

      var color = null;

      if (z != null && z > 0) {
        color = PALETTE[z - 1];
      } else {
        color = "#273ecc";
      }
      return color;
    }

    function f(n) {
      return (n.toFixed(2)+'').padStart(10, ' ')
    }


    context.save();

    context.moveTo(WIDTH/2, WIDTH/2)
    context.translate(hex.x, hex.y)

    let color = getColor(hex.z)

    console.log(f(hex.x), f(hex.y), f(hex.z), '  '+color);
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

    context.fill();
    context.restore();
  }
})

const out = fs.createWriteStream(__dirname + '/image.jpeg')
const stream = canvas.createJPEGStream()
stream.pipe(out)


console.log();
console.log(`new map of ${SEED} is ready`);
console.log(`radius: ${RADIUS}`);
console.log(`size:   ${SIZE}`);
console.log(`peaks:  ${PEAKS}`);


if (process.argv.length > 2 && process.argv[2] === '--dry-run') {
  console.log();
  console.log('Finnished dry run.');
} else {
  out.on('finish', () =>  {
    FB.api('me/photos', 'post', { source: fs.createReadStream(__dirname + '/image.jpeg'), caption: SEED }, function (res) {
      if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }
      console.log('Post Id: ' + res.post_id);
    });
  })
}
