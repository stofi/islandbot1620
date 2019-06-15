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
  constructor(x, y, z, parent, id) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
    this.elevation = null;
    this.coors = { type: 'hex', x: 0, y: 0, z: 0 }
  }

  toString() {
    return `${this.id}: ${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)} @${this.elevation}`
  }
}

class Map {
  constructor(radius, width, height, size, max_elevation, randomness, elevation_step) {

    // console.log(`+ map: ${size}`);
    this.width = width
    this.height = height
    this.radius = radius;
    this.size = size;
    this.hexagons = {};
    this.keys = [];
    this.populate();
    this.keysFlat = this.keys;
    this.waterEdges();
    this.keys = shuffle(this.keys);
    this.max_elevation = max_elevation
    this.randomness = randomness
    this.elevation_step = elevation_step
  }

  populate() {
    // console.log(`populating`);
    for (var x = -this.radius; x <= this.radius; x++) {
      for (var y = -this.radius; y <= this.radius; y++) {
        for (var z = -this.radius; z <= this.radius; z++) {
          if (x + y + z == 0) {
            this.hexagons[this.hash(x, y, z)] = new Hexagon(
              x,
              y,
              z,
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
      return key != hex.id;
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
          hex.x == this.radius ||
          hex.x == -this.radius ||
          hex.y == this.radius ||
          hex.y == -this.radius ||
          hex.z == this.radius ||
          hex.z == -this.radius
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
      let randomHex = this.randomFlat()
      randomHex.elevation = this.max_elevation;
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
    let shuffled = shuffle(this.keysFlat).pop()
    return this.hexagons[shuffled]
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

  loopByGrid() {
    // console.log('looping by grid');
    var z,
      x,
      y = 0;
    var start = 0;
    for (z = -this.radius; z <= this.radius; z++) {
      start = z > 0 ? -this.radius : -(z + this.radius);
      for (x = start; x < start + (this.radius * 2 + 1) + Math.abs(z); x++) {
        y = 0 - x - z;
        if (this.hexagons.hasOwnProperty(this.hash(x, y, z))) {
          this.drawHex(this.hexagons[this.hash(x, y, z)])
        }
      }
    }
  }

  draw(width) {
    this.loopByGrid();
    return Object.keys(this.hexagons).map(key => this.hexagons[key].coors)
  }

  drawHex(hex) {
    if (!this) return
    let x = this.width / 2
    let y = this.height / 2

    // translare by coordinates
    // on Z axis
    x += hex.z * (this.size * (5 / 6))
    y += hex.z * (this.size * 1.5)
    // on X axis
    x += -hex.x * (this.size / 12) * 11
    y += hex.x * (1.5 * this.size)

    hex.coors.x = x
    hex.coors.y = y
    hex.coors.z = hex.elevation || 0
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
    if (!hex) return false
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
              neighbours[i].elevation * (1 - this.elevation_step) +
              Math.random() * neighbours[i].elevation * this.elevation_step
            );
          } else if (
            neighbours[i].elevation != null &&
            neighbours[i].elevation < elevation * (1 - this.elevation_step)
          ) {
            elevation = Math.floor(
              (Math.random() * neighbours[i].elevation + elevation) / 2
            );
          }
        }
        if (elevation != null) {
          hex.elevation = elevation;

          neighbours = neighbours.filter(neighbour => neighbour.elevation);

          if (neighbours.length !== 0 && Math.random() > this.randomness) {
            this.elevate(
              neighbours[Math.floor(Math.random() * neighbours.length)]
            );
          }

          // debugger
          this.drawHex(hex)

          result = true;
          this.filterFlats(hex);
        }
      }
    }
    return result;
  }
}

module.exports = Map
