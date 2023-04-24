import {
  InputManager,
  SceneManager,
  RenderManager,
  PhysicsManager,
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

    // TODO
    // 브라우저에서 다른 탭으로 이동했다가 다시 게임으로 돌아오면
    // deltaTime이 0.0166보다 훨씬 더 커지기 때문에
    // 오브젝트가 순간이동해버린다.
    // 그래서 강제로 deltaTimeLimit를 사용하도록 바꿨는데,
    // 만약 모니터가 144hz라면 오류를 일으킬 것이 예상된다.
    while (this.timer.accumulatedTime > this.timer.deltaTimeLimit) {
      // Update physics
      PhysicsManager.update(
        SceneManager.getCurrentScene(),
        this.timer.deltaTimeLimit
      );
      this.timer.accumulatedTime -= this.timer.deltaTimeLimit;
    }

    // Update game logic
    SceneManager.getCurrentScene().update(this.timer.deltaTimeLimit);

    // Remove previous canvas
    RenderManager.clearScreen();

    // Render objects
    const alpha = this.timer.accumulatedTime / this.timer.deltaTimeLimit;
    RenderManager.render(alpha);

    requestAnimationFrame(() => {
      this.run();
    });
  }
}
