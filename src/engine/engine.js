import {
  InputManager,
  SceneManager,
  RenderManager,
  PhysicsManager,
  DestroyManager,
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

    this.timer = new Timer(settings.fps);
  }

  static init(settings) {
    // Set resolution
    RenderManager.changeResolution(settings.width, settings.height);

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
    SceneManager.getCurrentScene().update(this.timer.deltaTime);

    // TODO
    // 모니터가 144hz일 때 물리엔진의 업데이트가 매우 빠르게 진행되었다.
    // 주사율에 관계 없이 동일한 업데이트가 되어야 한다.
    while (this.timer.accumulatedTime > this.timer.fixedDeltaTime) {
      // Update physics
      PhysicsManager.update(
        SceneManager.getCurrentScene(),
        this.timer.fixedDeltaTime
      );
      this.timer.accumulatedTime -= this.timer.fixedDeltaTime;
    }

    SceneManager.getCurrentScene().calculateMatrix();

    // Render objects
    const alpha = this.timer.accumulatedTime / this.timer.fixedDeltaTime;
    RenderManager.render(alpha);

    // destroy objects
    DestroyManager.destroyAll();

    requestAnimationFrame(() => {
      this.run();
    });
  }
}
