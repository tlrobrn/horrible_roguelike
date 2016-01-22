var MapScene = {
  rngState: null,
  mapWidth: 0,
  mapHeight: 0,
  map: [],
  playerCoords: [],
  playerEnergy: 0,
  breadCoords: [],

  generateMap: function (seed) {
    seed = seed || ROT.RNG.getUniformInt(0, 11235813);
    ROT.RNG.setSeed(seed);
    this.rngState = ROT.RNG.getState();

    var mapGenerator = new ROT.Map.Cellular(this.mapWidth, this.mapHeight);
    var initialGen = new ROT.Map.Digger(this.mapWidth, this.mapHeight, {dugPercentage: 0.7});
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
      if (ROT.RNG.getUniform() < 0.01) {
        self.map[y][x] = '.';
      }
    });

    ROT.RNG.setState(this.rngState);

    var pathLength = 0;
    do {
      pathLength = 0;
      this.playerCoords = this.findFloor();
      this.breadCoords = this.findFloor();

      var astar = new ROT.Path.AStar(this.breadCoords[0], this.breadCoords[1], function (x, y) {
        return y < self.mapHeight && y >= 0 && x < self.mapWidth && x >= 0 && (self.map[y][x] === ' ' || self.map[y][x] === '.');
      }, {topology: 4});

      astar.compute(this.playerCoords[0], this.playerCoords[1], function (x, y) {
        pathLength += 1;
      });
    } while (pathLength <= 20);

    return [seed, pathLength - 5];
  },

  findFloor: function () {
    var x, y;
    do {
      x = ROT.RNG.getUniformInt(0, this.mapWidth - 1);
      y = ROT.RNG.getUniformInt(0, this.mapHeight - 1);
    } while (this.map[y][x] !== ' ');

    return [x, y];
  },

  nextCoords: function (dir) {
    var x = this.playerCoords[0] + dir[0],
        y = this.playerCoords[1] + dir[1];

    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return this.playerCoords;
    if (this.map[y][x] === '#') return this.playerCoords;

    return [x, y];
  },

  init: function() {
    this.mapWidth = width * 2;
    this.mapHeight = height * 2;
    var metadata = this.generateMap();
    this.seed = metadata[0];
    this.playerEnergy = metadata[1];

    var self = this;
    this.handleKeys = function (event) {
      if (self.playerEnergy <= 0) {
        sceneManager.loadScene("lose");
        return;
      }

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
        self.draw();
        return;
      default:
        return;
      }

      var desiredCoords = self.nextCoords(dir);
      if (desiredCoords[0] === self.playerCoords[0] && desiredCoords[1] === self.playerCoords[1]) {
        return;
      }

      self.playerEnergy -= 1;

      if (desiredCoords[0] === self.breadCoords[0] && desiredCoords[1] === self.breadCoords[1]) {
        sceneManager.loadScene("win");
        return;
      }
      else if (self.map[desiredCoords[1]][desiredCoords[0]] === '.') {
        self.playerEnergy += 11;
        self.map[desiredCoords[1]][desiredCoords[0]] = ' ';
      }

      self.playerCoords = desiredCoords;
      self.draw();
    };
    document.addEventListener("keydown", this.handleKeys);

    this.draw();
  },

  draw: function() {
    var topLeftX = Math.floor(this.playerCoords[0] - (width / 2)),
        topLeftY = Math.floor(this.playerCoords[1] - (height / 2));

    if (topLeftX < 0) { topLeftX = 0; }
    if (topLeftX > this.mapWidth - width) { topLeftX = this.mapWidth - width; }
    if (topLeftY < 0) { topLeftY = 0; }
    if (topLeftY > this.mapHeight - height) { topLeftY = this.mapHeight - height; }

    var playerX = 0,
        playerY = 0;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var token = this.map[y + topLeftY][x + topLeftX];
        display.draw(x, y, token, (token === '.')? "#00F" : null);
        if (x + topLeftX == this.breadCoords[0] && y + topLeftY === this.breadCoords[1]) {
          display.draw(x, y, ' ', null, "#0E0");
        }
        if (x + topLeftX == this.playerCoords[0] && y + topLeftY === this.playerCoords[1]) {
          playerX = x;
          playerY = y;
          display.draw(x, y, '@', "#0F0");
        }
      }
    }

    this.drawArrow(playerX, playerY);
    display.drawText(0, 0, "%c{#FF0}Level: " + this.seed + " | Energy: " + this.playerEnergy);
  },

  drawArrow: function (x, y) {
    var xDist = this.playerCoords[0] - this.breadCoords[0],
        yDist = this.playerCoords[1] - this.breadCoords[1];

    if (Math.abs(xDist) > Math.abs(yDist)) {
      if (xDist > 0) {
        display.draw(x - 1, y, '<', "#440");
      }
      else {
        display.draw(x + 1, y, '>', "#440");
      }
    }
    else {
      if (yDist > 0) {
        display.draw(x, y - 1, '^', "#440");
      }
      else {
        display.draw(x, y + 1, 'v', "#440");
      }
    }
  },

  teardown: function (callback) {
    document.removeEventListener("keydown", this.handleKeys);
    display.clear();
    callback();
  }
}
