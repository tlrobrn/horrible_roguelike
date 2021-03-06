var WinScene = {
  init: function() {
    this.handleKeys = function (event) {
      sceneManager.loadScene("title");
    }

    document.addEventListener("keydown", this.handleKeys);

    this.draw();
  },

  draw: function() {
    display.drawText(2, 2, "YOU WIN");
  },

  teardown: function (callback) {
    document.removeEventListener("keydown", this.handleKeys);
    display.clear();
    callback();
  }
};
