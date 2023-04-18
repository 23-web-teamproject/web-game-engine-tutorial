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
    // Set resolution
    RenderManager.changeResolution(1280, 760);

    // Load scene
    SceneManager.changeScene(ExampleScene);
  }

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
