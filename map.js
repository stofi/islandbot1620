const chroma = require("chroma-js")

const RADIUS = 21,          // Radius of the hexagonal map
      MAX_ELEVATION = 512,  // Number of possible elevations
      ELEVATION_STEP = 0.2, // 0 - table mountain island, 1 isolated peaks
      RANDOMNESS = 0.5,     // 0 - very rough and diconected shapes, 1 - smooth continuous islands
      SIZE = 20,            // Radius of one hex in px
      PALETTE = chroma.scale(["14640a", "fbf84f", "6b030a"]).colors(MAX_ELEVATION),
      PEAKS = 3,
      SEED = Math.floor(Math.random() * 1000).toString(16) + "land";


function shuffle(array) {
  var a = array.slice();
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
  return a;
}

function degToRad(deg) {
  return (Math.PI / 180) * deg;
}

class Hexagon {
  constructor(x, y, z, context, parent, id) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
    this.elevation = null;
    this.context = context;
    this.parent = parent;
  }

  draw(size) {
    this.context.save();

    // Start from the center
    this.context.translate(
      this.context.canvas.width / 2,
      this.context.canvas.height / 2
    );

    // translare by coordinates
    // on Z axis
    this.context.translate(this.z * (size * (5 / 6)), this.z * (size * 1.5));
    // on X axis
    this.context.translate(-this.x * (size / 12) * 11, this.x * (1.5 * size));
    // draw hexagon
    this.drawPixels(size);

    this.context.restore();
  }

  drawPixels(unit) {
    // console.log(`painting ${this.id}`);

    this.context.save();
    this.context.beginPath();

    var size = unit * 1.02; // slightly increase the size, cleans rounding artifacts
    var angle;

    angle = degToRad(90); // start at 90deg

    this.context.moveTo(size * Math.cos(angle), size * Math.sin(angle));

    for (var i = 1; i < 7; i++) {
      // rotate by 60deg
      angle = degToRad(60 * i + 30);
      this.context.lineTo(size * Math.cos(angle), size * Math.sin(angle));
    }

    this.context.closePath();

    this.context.fillStyle = this.getColor();

    this.context.fill();
    this.context.restore();
  }

  getColor() {
    // this is ugly :(

    var color = null;

    if (this.elevation != null && this.elevation > 0) {
      color = PALETTE[this.elevation - 1];
    } else {
      color = "#273ecc";
    }

    return color;
  }
}

class Map {
  constructor(size, context) {
    // console.log(`+ map: ${size}`);
    this.context = context;
    this.size = size;
    this.hexagons = {};
    this.keys = [];
    this.populate();
    this.keysFlat = this.keys;
    this.waterEdges();
    this.keys = shuffle(this.keys);
  }

  populate() {
    // console.log(`populating`);
    for (var x = -this.size; x <= this.size; x++) {
      for (var y = -this.size; y <= this.size; y++) {
        for (var z = -this.size; z <= this.size; z++) {
          if (x + y + z == 0) {
            this.hexagons[this.hash(x, y, z)] = new Hexagon(
              x,
              y,
              z,
              this.context,
              this,
              this.hash(x, y, z)
            );
            this.keys.push(this.hash(x, y, z));
          }
        }
      }
    }
  }

  filterFlats(hex) {
    // console.log(`running filter`);
    this.keysFlat = this.keysFlat.filter(key => {
      return key != hex.hash;
    });
  }

  waterEdges() {
    // filter is slow, find better implementation?
    // console.log('watering');
    var hex = null;
    for (var hexa in this.hexagons) {
      if (this.hexagons.hasOwnProperty(hexa)) {
        hex = this.hexagons[hexa];
        if (
          hex.x == this.size ||
          hex.x == -this.size ||
          hex.y == this.size ||
          hex.y == -this.size ||
          hex.z == this.size ||
          hex.z == -this.size
        ) {
          hex.elevation = 0;

          this.filterFlats(hex);
        }
      }
    }
  }

  addNRandomPeaks(n) {
    // console.log(`adding ${n} peaks`);
    for (var i = 0; i < n; i++) {
      this.randomFlat().elevation = MAX_ELEVATION;
    }
  }

  hash(x, y, z) {
    return "hex_" + (1000 - x) + (1000 - y) + (1000 - z);
  }

  getHexagon(x, y, z) {
    // console.log(`getting hex(${x},${y},${z})`);
    if (this.hexagons[this.hash(x, y, z)]) {
      return this.hexagons[this.hash(x, y, z)];
    } else return null;
  }

  randomHexagon() {
    // console.log('getting random hex');
    var shuffled = shuffle(this.keys);
    return this.hexagons[shuffled[0]];
  }
  randomFlat() {
    var shuffled = shuffle(this.keysFlat);
    return this.hexagons[shuffled[0]];
  }

  loopByHash(f) {
    // console.log('looping by hash');
    for (var i = 0; i < this.keys.length; i++) {
      // // console.log(this.keys[i]);
      if (this.hexagons.hasOwnProperty(this.keys[i])) {
        f(this.hexagons[this.keys[i]]);
      }
    }
  }

  loopByGrid(f) {
    // console.log('looping by grid');
    var z,
      x,
      y = 0;
    var start = 0;
    for (z = -RADIUS; z <= RADIUS; z++) {
      start = z > 0 ? -RADIUS : -(z + RADIUS);
      for (x = start; x < start + (RADIUS * 2 + 1) + Math.abs(z); x++) {
        y = 0 - x - z;
        if (this.hexagons.hasOwnProperty(this.hash(x, y, z))) {
          f(this.hexagons[this.hash(x, y, z)]);
        }
      }
    }
  }

  draw(width) {
    // console.log(`drawing width: ${width}`);
    let context = this.context

    context.rect(0, 0, context.canvas.width, context.canvas.height)
    context.fillStyle = '#273ecc'
    context.fill()

    this.loopByGrid(hex => {
      hex.draw(width);
    });
  }

  getNeigbours(parent) {
    // console.log('looking for neigbours');
    var x = parent.x;
    var y = parent.y;
    var z = parent.z;
    var result = [];
    var hex;

    var hex = this.getHexagon(x + 1, y, z - 1);
    if (hex != null) result.push(hex);

    var hex = this.getHexagon(x - 1, y, z + 1);
    if (hex != null) result.push(hex);

    var hex = this.getHexagon(x, y + 1, z - 1);
    if (hex != null) result.push(hex);

    var hex = this.getHexagon(x, y - 1, z - 1);
    if (hex != null) result.push(hex);

    var hex = this.getHexagon(x + 1, y - 1, z);
    if (hex != null) result.push(hex);

    var hex = this.getHexagon(x - 1, y + 1, z);
    if (hex != null) result.push(hex);

    return result;
  }

  elevateAll() {
    // console.log('elevating all');
    for (var i = 0; i < 10000 && this.keysFlat.length > 0; i++) {
      this.elevate(this.randomFlat());
    }
  }

  elevate(hex) {
    // console.log('elevating hex');
    var neighbours = [];
    var elevation = null;
    var result = false;
    if (hex.elevation == null) {
      neighbours = this.getNeigbours(hex);

      if (neighbours != []) {
        for (var i = 0; i < neighbours.length; i++) {
          if (elevation == null && neighbours[i].elevation != null) {
            elevation = Math.floor(
              neighbours[i].elevation * (1 - ELEVATION_STEP) +
                Math.random() * neighbours[i].elevation * ELEVATION_STEP
            );
          } else if (
            neighbours[i].elevation != null &&
            neighbours[i].elevation < elevation * (1 - ELEVATION_STEP)
          ) {
            // elevation = Math.floor(Math.random()*neighbours[i].elevation*(1-ELEVATION_STEP))
            elevation = Math.floor(
              (Math.random() * neighbours[i].elevation + elevation) / 2
            );
          }
        }
        if (elevation != null) {
          hex.elevation = elevation;
          // if (elevation < MAX_ELEVATION/10) {
          //    hex.elevation = Math.floor(MAX_ELEVATION/10)
          // }

          neighbours = neighbours.filter(function(neighbour) {
            return neighbours.elevation == null;
          });

          if (neighbours != [] && Math.random() > RANDOMNESS) {
            this.elevate(
              neighbours[Math.floor(Math.random() * (neighbours.length - 1))]
            );
          }

          // debugger
          hex.draw(this.size);

          result = true;
          this.filterFlats(hex);
        }
      }
    }
    return result;
  }
}

module.exports = Map
