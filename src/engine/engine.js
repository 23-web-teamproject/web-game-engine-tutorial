import { InputManager, SceneManager } from "/src/engine/core.js";
import { Timer } from "/src/engine/utils.js";

import ExampleScene from "/src/example-scene/scene.js";

class Engine {
  constructor() {
    this.inputManager = new InputManager();
    this.SceneManager = new SceneManager();

    this.timer = new Timer();
  }

  init() {
    // Initialize page resolution
    this.initializePageResolution();

    SceneManager.RegisterEngine(this);
    // Load scene
    SceneManager.LoadScene(ExampleScene);
  }

  // TODO
  // 게임화면의 해상도를 특정 해상도로 변경할 수 있게 한다.
  initializePageResolution() {}

  run() {
    // 매 프레임마다 실행시키는 함수를 못찾아서
    // 어쩔 수 없이 특정 시간마다 함수를 호출하도록 함
    setInterval(() => {
      // Calculate delta time
      this.timer.update();

      // Update input
      this.inputManager.update();
            
      // Update game logic
      this.currentScene.update(this.timer.deltaTime);
      
      // Update graphic logic
      this.currentScene.render();
    }, 10);
  }
}

window.onload = () => {
  const engine = new Engine();

  engine.init();
  engine.run();
};
