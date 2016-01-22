function SceneManager () {
  this.scenes = {};
  this.currentScene = null;
};

SceneManager.prototype.addScene = function (name, scene) {
  if (!this.scenes[name]) {
    this.scenes[name] = scene;
  }
};

SceneManager.prototype.setScene = function (name) {
  var self = this;
  return function () {
    self.currentScene = self.scenes[name];
    self.currentScene.init();
  };
};

SceneManager.prototype.loadScene = function (name) {
  if (this.scenes[name]) {
    var initScene = this.setScene(name);

    if (this.currentScene) {
      this.currentScene.teardown(initScene);
    }
    else {
      initScene();
    }
  }
  else {
    console.log("No scene named:", name);
  }
};

var sceneManager = new SceneManager();
