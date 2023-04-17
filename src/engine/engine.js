import {
  InputManager,
  SceneManager,
  RenderManager,
} from "/src/engine/module.js";
import { Timer } from "/src/engine/utils.js";

import ExampleScene from "/src/example-scene/scene.js";

class Engine {
  constructor() {
    this.inputManager = new InputManager();

    this.timer = new Timer();
  }

  init() {
    // Initialize page resolution
    this.initializePageResolution();

    // Load scene
    SceneManager.changeScene(ExampleScene);
  }

  // TODO
  // 게임화면의 해상도를 특정 해상도로 변경할 수 있게 한다.
  initializePageResolution() {}

  run() {
    // Calculate delta time
    this.timer.update();

    // Update input
    this.inputManager.update();

    // Update game logic
    SceneManager.getCurrentScene().update(this.timer.deltaTime);

    // Remove previous canvas
    RenderManager.clearScreen();

    // Render objects
    RenderManager.render();

    requestAnimationFrame(() => {
      this.run();
    });
  }
}

window.onload = () => {
  const engine = new Engine();

  engine.init();
  requestAnimationFrame(() => {
    engine.run();
  });
};
