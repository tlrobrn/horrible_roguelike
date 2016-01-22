// Tileset
var tileSet = document.createElement("img");
tileSet.src = "dungeontiles-blue.png";

// Setup Display
var width = 40,
    height = 25;

var displayOptions = {
  layout: "tile",
  bg: "transparent",
  tileWidth: 24,
  tileHeight: 24,
  tileSet: tileSet,
  tileMap: {
    '@': [168, 264],
    '#': [0, 24],
    ' ': [24, 0]
  },
  width: width,
  height: height
}

var display = new ROT.Display(displayOptions);
document.body.appendChild(
  display.getContainer()
);

// Generate map
var seed = ROT.RNG.getUniformInt(0, 11235813);
var div = document.body.appendChild(document.createElement("div"));
div.appendChild(document.createTextNode("SEED: " + seed));

ROT.RNG.setSeed(seed);
var rngState = ROT.RNG.getState();

var map = [];
var mapGenerator = new ROT.Map.Cellular(width, height);
var initialGen = new ROT.Map.Digger(width, height, {dugPercentage: 0.7});
initialGen.create(function (x, y, isWall) {
  mapGenerator.set(x, y, isWall);
});

for (var i = 0; i < 2; i++) {
  mapGenerator.create();
}

mapGenerator.create(function (x, y, isWall) {
  if (!map[y]) { map[y] = []; }
  map[y][x] = isWall? '#' : ' ';
});

ROT.RNG.setState(rngState);

// Player positioning
function findRandomFloorSpace (m) {
  var x, y;
  do {
    x = ROT.RNG.getUniformInt(0, width - 1);
    y = ROT.RNG.getUniformInt(0, height - 1);
  } while (m[y][x] !== ' ');

  return [x, y];
}

var playerCoords = findRandomFloorSpace(map);

// Display
function drawMap () {
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      display.draw(x, y, map[y][x]);
    }
  }

  display.draw(playerCoords[0], playerCoords[1], [map[playerCoords[1]][playerCoords[0]], '@']);
}

// Event Handling
function nextCoords(dir) {
  var x = playerCoords[0] + dir[0],
      y = playerCoords[1] + dir[1];

  if (x < 0 || x >= width || y < 0 || y >= height) return playerCoords;
  if (map[y][x] !== ' ') return playerCoords;

  return [x, y];
}

document.addEventListener("keydown", function (event) {
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
    ROT.RNG.setState(rngState);
    playerCoords = findRandomFloorSpace(map);
    dir = [0, 0];
    break;
  default:
    return;
  }

  playerCoords = nextCoords(dir);
  drawMap();
});

tileSet.onload = drawMap;
