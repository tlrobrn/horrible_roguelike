// Tileset
var tileSet = document.createElement("img");
tileSet.src = "dungeontiles-blue.png";

// Setup Display
var width = 40,
    height = 25;

var displayOptions = {
  width: width,
  height: height
}

var display = new ROT.Display(displayOptions);
document.body.appendChild(
  display.getContainer()
);

sceneManager.addScene("title", TitleScene);
sceneManager.addScene("map", MapScene);
sceneManager.addScene("lose", LoseScene);
sceneManager.addScene("win", WinScene);

tileSet.onload = function () {
  sceneManager.loadScene("title");
};
