import {
  HTMLManager,
  InputManager,
  SceneManager,
  RenderManager,
  PhysicsManager,
  DestroyManager,
  LayerManager,
  Debug,
} from "/src/engine/module.js";

import makeForm from "/src/engine/form.js";

import { Timer, writeErrorMessageOnDocument } from "/src/engine/utils.js";

/**
 * 게임 로직을 실행하고 물리효과를 적용시키며 화면에 렌더링하는 엔진이다.
 */
class Engine {
  /**
   * 입력 이벤트를 관리하는 객체다.
   *
   * @type {InputManager}
   * @static
   */
  static inputManager;
  /**
   * 엔진의 update에서 사용하는 deltaTime을 관리하는 객체다.
   *
   * @type {Timer}
   * @static
   */
  static timer;

  /**
   * 이 변수가 true라면 엔진을 일시정지한다.
   * 기본값은 false다.
   *
   * @type {boolean}
   * @static
   */
  static isPause;

  constructor() {}

  /**
   * 인자로 전달된 값을 이용해 엔진을 초기화한다.
   *
   * @param {object} [settings]
   * @param {number} [settings.width]
   * @param {number} [settings.height]
   * @param {number} [settings.fps]
   * @param {string} [settings.title]
   * @param {string} [settings.faviconPath]
   * @param {GameObject} [settings.scene]
   */
  static init(settings) {
    try {
      // 페이지의 타이틀을 정한다.
      HTMLManager.setTitle(settings.title);

      // 페이지의 아이콘을 정한다.
      HTMLManager.setFavicon(settings.faviconPath);

      // 엔진의 static 변수들을 초기화한다.
      Engine.initAllStaticVariable(settings);

      // canvas의 해상도를 변경한다.
      RenderManager.changeResolution(settings.width, settings.height);

      // 레이어 상태를 초기화한다.
      LayerManager.initializePhysicsInteractionState();

      // 씬을 불러온다.
      // 씬의 모든 리소스가 로드되었을 때 엔진을 실행하는
      // 콜백함수를 인자로 넘겨준다.
      SceneManager.loadScene(settings.scene, () => {
        const engine = new Engine();
        setInterval(engine.run, 1000 * Engine.timer.fixedDeltaTime);
      });
    } catch (error) {
      writeErrorMessageOnDocument(error);
    }
  }

  /**
   * form으로부터 전달된 값으로 엔진을 초기화한다.
   *
   * @param {object} options
   * @param {string} options.thumbnailImagePath
   * @param {string} options.title
   * @param {GameObject} options.scene
   */
  static async initWithForm(options) {
    // 먼저 form을 생성한다.
    await makeForm(options.thumbnailImagePath, (data) => {
      Engine.init({
        width: data.width,
        height: data.height,
        fps: data.fps,
        title: options.title,
        scene: options.scene,
      });
    });
  }

  /**
   * 엔진의 모든 static 변수들을 초기화한다.
   */
  static initAllStaticVariable(settings) {
    // InputManager를 초기화한다.
    Engine.inputManager = new InputManager();

    // fps를 타이머에 등록하여 fixedDeltaTime을 프레임에 맞게 변경한다.
    Engine.timer = new Timer();
    Engine.timer.setFps(settings.fps);

    // isPause를 false로 설정한다.
    Engine.isPause = false;

    Debug.addPauseToggleEventListener();
  }

  /**
   * 게임 파이프라인에 대해서는 이 게시글을 참고했다.
   * https://developer.ibm.com/tutorials/wa-build2dphysicsengine/#physics-loop-step
   */
  run() {
    try {
      // 이전 프레임와 현재 프레임의 시간차를 계산한다.
      Engine.timer.update();

      // 키의 상태를 업데이트한다.
      Engine.inputManager.update();

      // 일시정지 상태가 아닐 때에만 엔진을 업데이트한다.
      if (Engine.isPause === false) {
        // 씬의 모든 객체들의 matrix를 업데이트한다.
        SceneManager.getCurrentScene().updateMatrix();

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
      }

      // 모든 오브젝트를 canvas에 그린다.
      RenderManager.render();

      // 삭제되길 기다리는 오브젝트가 있다면 모두 삭제한다.
      DestroyManager.destroyAll();
    } catch (error) {
      writeErrorMessageOnDocument(error);
    }
  }
}

export default Engine;
