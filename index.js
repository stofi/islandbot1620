const FB = require('fb')
const fs = require('fs')
const seedrandom = require("seedrandom")
const { createCanvas } = require("canvas")
const canvas = createCanvas(1440, 1440, {pixelFormat: "RGB16_565"})
const nameGenerator = require('./namegenerator.js')
const Map = require('./map.js')

const {FACEBOOK_ACCESS_TOKEN} = require('./private.json')

FB.setAccessToken(FACEBOOK_ACCESS_TOKEN)

const SEED = nameGenerator()

seedrandom(SEED, { global: true })

const RADIUS = 21, SIZE = 20, PEAKS = 3


const ctx = canvas.getContext("2d");
var map = new Map(RADIUS, ctx);

map.addNRandomPeaks(PEAKS);
map.elevateAll();
map.draw(SIZE);

const out = fs.createWriteStream(__dirname + '/image.jpeg')
const stream = canvas.createJPEGStream()
stream.pipe(out)

console.log();
console.log(`new map of ${SEED} is ready`);
console.log(`radius: ${RADIUS}`);
console.log(`size:   ${SIZE}`);
console.log(`peaks:  ${PEAKS}`);


out.on('finish', () =>  {
  FB.api('me/photos', 'post', { source: fs.createReadStream(__dirname + '/image.jpeg'), caption: SEED }, function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log('Post Id: ' + res.post_id);
  });
})
