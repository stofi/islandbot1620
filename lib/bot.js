require('dotenv').config()

const FB = require('fb')
const fs = require('fs')
const seedrandom = require("seedrandom")
const { createCanvas } = require("canvas")
const nameGenerator = require('./namegenerator.js')
const database = require('./db.js')
const paint = require('./paint')

const start = async () => {
    let db = await database()
    const SEED = nameGenerator({ db })
    seedrandom(SEED, { global: true })

    const PEAKS = Math.floor(2 + Math.random() * 4),
        RADIUS = 21 - Math.floor(Math.random() * (16 - PEAKS * 3)),
        SIZE = Math.floor(20 / RADIUS * 21),
        WIDTH = 1440,
        MAX_ELEVATION = 512,
        ELEVATION_STEP = .2 - Math.random() / 15,
        RANDOMNESS = .5 + Math.floor(Math.random() * 3) / 10

    const canvas = createCanvas(WIDTH, WIDTH, { pixelFormat: "RGB16_565" })

    paint(canvas, { RADIUS, WIDTH, SIZE, MAX_ELEVATION, RANDOMNESS, ELEVATION_STEP, SIZE, PEAKS })
    const out = fs.createWriteStream(__dirname + '/image.jpeg')
    const stream = canvas.createJPEGStream()
    stream.pipe(out)


    console.log();
    console.log(`new map of ${SEED} is ready`);
    console.log(`radius: ${RADIUS}`);
    console.log(`size:   ${SIZE}`);
    console.log(`peaks:  ${PEAKS}`);
    console.log(`random:  ${RANDOMNESS}`);
    console.log(`elevation:  ${MAX_ELEVATION}`);
    console.log(`step:  ${ELEVATION_STEP}`);

    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN
    FB.setAccessToken(FACEBOOK_ACCESS_TOKEN)

    if (process.argv.length > 2 && process.argv[2] === '--dry-run') {
        console.log();
        console.log('Finnished dry run.');
    } else {
        out.on('finish', () => {
            FB.api('me/photos', 'post', { source: fs.createReadStream(__dirname + '/image.jpeg'), caption: SEED }, function (res) {
                if (!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    return;
                }
                console.log('Post Id: ' + res.post_id);

                fs.appendFile('db', SEED + '\r\n', function (err) {
                    if (err) console.log('Error saving database');
                    console.log('Database updated.');
                });
            });
        })
    }

}

module.exports = start