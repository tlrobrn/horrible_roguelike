var TitleScene = {
  init: function () {
    this.handleKeys = function (event) {
      sceneManager.loadScene("map");
    }

    document.addEventListener("keydown", this.handleKeys);

    this.draw();
  },

  draw: function() {
    display.drawText(2, 2, "Press any key to play");
  },

  teardown: function (callback) {
    document.removeEventListener("keydown", this.handleKeys);
    display.clear();
    callback();
  }
}
