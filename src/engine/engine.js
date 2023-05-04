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
  static inputManager = new InputManager();
  static timer = new Timer();

  constructor() {}

  static init(settings) {
    Engine.timer.setFps(settings.fps);

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
    Engine.timer.update();

    // Update input
    Engine.inputManager.update();

    // Update game logic
    SceneManager.getCurrentScene().update(Engine.timer.deltaTime);

    // TODO
    // 모니터가 144hz일 때 물리엔진의 업데이트가 매우 빠르게 진행되었다.
    // 주사율에 관계 없이 동일한 업데이트가 되어야 한다.
    while (Engine.timer.accumulatedTime > Engine.timer.fixedDeltaTime) {
      // Update physics
      PhysicsManager.update(
        SceneManager.getCurrentScene(),
        Engine.timer.fixedDeltaTime
      );
      Engine.timer.accumulatedTime -= Engine.timer.fixedDeltaTime;
    }

    SceneManager.getCurrentScene().calculateMatrix();

    // Render objects
    const alpha = Engine.timer.accumulatedTime / Engine.timer.fixedDeltaTime;
    RenderManager.render(alpha);

    // destroy objects
    DestroyManager.destroyAll();

    requestAnimationFrame(() => {
      this.run();
    });
  }
}
