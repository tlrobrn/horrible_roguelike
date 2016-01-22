var MapScene = {
  rngState: null,
  map: [],
  playerCoords: [],

  generateMap: function (seed) {
    seed = seed || ROT.RNG.getUniformInt(0, 11235813);
    ROT.RNG.setSeed(seed);
    this.rngState = ROT.RNG.getState();

    var mapGenerator = new ROT.Map.Cellular(width, height);
    var initialGen = new ROT.Map.Digger(width, height, {dugPercentage: 0.7});
    initialGen.create(function (x, y, isWall) {
      mapGenerator.set(x, y, isWall);
    });

    for (var i = 0; i < 2; i++) {
      mapGenerator.create();
    }

    var self = this;
    mapGenerator.create(function (x, y, isWall) {
      if (!self.map[y]) { self.map[y] = []; }
      self.map[y][x] = isWall? '#' : ' ';
    });

    ROT.RNG.setState(this.rngState);

    return seed;
  },

  findFloor: function () {
    var x, y;
    do {
      x = ROT.RNG.getUniformInt(0, width - 1);
      y = ROT.RNG.getUniformInt(0, height - 1);
    } while (this.map[y][x] !== ' ');

    return [x, y];
  },

  nextCoords: function (dir) {
    var x = this.playerCoords[0] + dir[0],
        y = this.playerCoords[1] + dir[1];

    if (x < 0 || x >= width || y < 0 || y >= height) return this.playerCoords;
    if (this.map[y][x] !== ' ') return this.playerCoords;

    return [x, y];
  },

  init: function() {
    var seed = this.generateMap();
    this.playerCoords = this.findFloor();

    var self = this;
    this.handleKeys = function (event) {
      var dir;
      switch (event.keyCode) {
      case ROT.VK_E:
        dir = ROT.DIRS[4][0];
        break;
      case ROT.VK_F:
        dir = ROT.DIRS[4][1];
        break;
      case ROT.VK_D:
        dir = ROT.DIRS[4][2];
        break;
      case ROT.VK_S:
        dir = ROT.DIRS[4][3];
        break;
      case ROT.VK_R:
        ROT.RNG.setState(self.rngState);
        self.playerCoords = self.findFloor();
        dir = [0, 0];
        break;
      default:
        return;
      }

      self.playerCoords = self.nextCoords(dir);
      self.draw();
    };
    document.addEventListener("keydown", this.handleKeys);

    this.draw();

    var div = document.body.appendChild(document.createElement("div"));
    div.appendChild(document.createTextNode("SEED: " + seed));
  },

  draw: function() {
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        display.draw(x, y, this.map[y][x]);
      }
    }

    display.draw(this.playerCoords[0], this.playerCoords[1], '@', "#FF0");
  },

  teardown: function (callback) {
    document.removeEventListener("keydown", this.handleKeys);
    display.clear();
    callback();
  }
}
