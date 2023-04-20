import {
  InputManager,
  SceneManager,
  RenderManager,
} from "/src/engine/module.js";
import { Timer } from "/src/engine/utils.js";

window.onload = () => {
  const engine = new Engine();

  requestAnimationFrame(() => {
    engine.run();
  });
};

export default class Engine {
  constructor() {
    this.inputManager = new InputManager();

    this.timer = new Timer();
  }

  static registerInitialScene(newScene) {
    // Set resolution
    RenderManager.changeResolution(1280, 720);

    // Load scene
    SceneManager.changeScene(newScene);
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
