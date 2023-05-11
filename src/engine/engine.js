import {
  InputManager,
  SceneManager,
  RenderManager,
  PhysicsManager,
  DestroyManager,
  LayerManager,
} from "/src/engine/module.js";

import { Timer } from "/src/engine/utils.js";

window.addEventListener("runEngine", () => {
  const engine = new Engine();

  // requestAnimationFrame으로 매 프레임마다 렌더링할 수 있지만
  // 그렇게 된다면 프레임을 변경한 효과가 드러나지 않기 때문에
  // 어쩔 수 없이 fixedDeltaTime마다 run을 호출하는 방향으로 정했다.
  setInterval(engine.run, 1000 * Engine.timer.fixedDeltaTime);
});

/**
 * 게임 로직을 실행하고 물리효과를 적용시키며 화면에 렌더링하는 엔진이다.
 */
export default class Engine {
  /** @type {InputManager} @static */
  static inputManager = new InputManager();
  /** @type {Timer} @static */
  static timer = new Timer();

  constructor() {}

  /**
   * 인자로 전달된 값을 이용해 엔진을 초기화한다.
   *
   * @param {object} [settings]
   * @param {number} [settings.width]
   * @param {number} [settings.height]
   * @param {number} [settings.fps]
   * @param {GameObject} [settings.scene]
   */
  static init(settings) {
    // fps를 타이머에 등록하여 fixedDeltaTime을 프레임에 맞게 변경한다.
    Engine.timer.setFps(settings.fps);

    // canvas의 해상도를 변경한다.
    RenderManager.changeResolution(settings.width, settings.height);

    // 레이어 상태를 초기화한다.
    LayerManager.initializePhysicsInteractionState();

    // 씬을 불러온다.
    SceneManager.changeScene(settings.scene);
  }

  /**
   * 게임 파이프라인에 대해서는 이 게시글을 참고했다.
   * https://developer.ibm.com/tutorials/wa-build2dphysicsengine/#physics-loop-step
   */
  run() {
    // 이전 프레임와 현재 프레임의 시간차를 계산한다.
    Engine.timer.update();

    // 키의 상태를 업데이트한다.
    Engine.inputManager.update();

    // 게임 로직을 처리한다.
    SceneManager.getCurrentScene().update(Engine.timer.deltaTime);

    // 물리 효과를 적용한다.
    while (Engine.timer.accumulatedTime > Engine.timer.fixedDeltaTime) {
      PhysicsManager.update(
        SceneManager.getCurrentScene(),
        Engine.timer.fixedDeltaTime
      );
      Engine.timer.accumulatedTime -= Engine.timer.fixedDeltaTime;
    }

    // 물리효과를 적용하고 나서 모든 오브젝트의 matrix를 업데이트한다.
    SceneManager.getCurrentScene().calculateMatrix();

    // 모든 오브젝트를 canvas에 그린다.
    const alpha = Engine.timer.accumulatedTime / Engine.timer.fixedDeltaTime;
    RenderManager.render(alpha);

    // 삭제되길 기다리는 오브젝트가 있다면 모두 삭제한다.
    DestroyManager.destroyAll();
  }
}
