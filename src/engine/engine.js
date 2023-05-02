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

  static init(settings) {
    let width = 1280;
    if (settings.hasOwnProperty("width")) {
      width = settings.width;
    }
    let height = 720;
    if (settings.hasOwnProperty("height")) {
      height = settings.height;
    }
    // Set resolution
    RenderManager.changeResolution(width, height);

    // Load scene
    SceneManager.changeScene(settings.scene);
  }

  /*
   * 게임 파이프라인에 대해서는 이 게시글을 참고했다.
   * https://developer.ibm.com/tutorials/wa-build2dphysicsengine/#physics-loop-step
   */
  run() {
    // Calculate delta time
    this.timer.update();

    // Update input
    this.inputManager.update();

    // Update game logic
    SceneManager.getCurrentScene().update(this.timer.fixedDeltaTime);

    // TODO
    // 브라우저에서 다른 탭으로 이동했다가 다시 게임으로 돌아오면
    // deltaTime이 0.0166보다 훨씬 더 커지기 때문에
    // 오브젝트가 순간이동해버린다.
    // 그래서 강제로 fixedDeltaTime 사용하도록 바꿨는데,
    // 만약 모니터가 144hz라면 오류를 일으킬 것이 예상된다.
    while (this.timer.accumulatedTime > this.timer.fixedDeltaTime) {
      // Update physics
      PhysicsManager.update(
        SceneManager.getCurrentScene(),
        this.timer.fixedDeltaTime
      );
      this.timer.accumulatedTime -= this.timer.fixedDeltaTime;
    }

    SceneManager.getCurrentScene().calculateMatrix();

    // Remove previous canvas
    RenderManager.clearScreen();

    // Render objects
    const alpha = this.timer.accumulatedTime / this.timer.fixedDeltaTime;
    RenderManager.render(alpha);

    requestAnimationFrame(() => {
      this.run();
    });
  }
}
