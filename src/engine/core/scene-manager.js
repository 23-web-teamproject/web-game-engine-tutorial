import ResourceManager from "/src/engine/core/resource-manager.js";

/**
 * 씬 객체를 다루는 책임을 맡는다.
 * 엔진 내에서 씬을 교체한다거나 현재 씬 객체를 반환하는 일을 한다.
 *
 * 씬 객체란, 게임 캐릭터나 이펙트, 애니메이션 등 게임 내에서 등장하는
 * 모든 오브젝트들의 최상위 오브젝트를 말한다.
 * 씬 객체는 모든 게임 오브젝트를 통제하여 게임의 로직을 설계하고 관리하게 된다.
 */
class SceneManager {
  /**
   * 엔진에 연결된 현재 씬
   *
   * @property {GameObject}
   * @static
   */
  static currentScene = undefined;

  constructor() {}

  /**
   * 새로운 씬을 생성해 currentScene에 저장하여 씬을 교체한다.
   * 만약 새로운 씬이 리소스를 불러와야 하는 객체를 갖고 있지 않으면
   * 곧바로 씬을 교체하고, 그렇지 않으면 ResourceManager에
   * 콜백함수를 등록하여 모든 리소스가 불러와졌을 때 콜백함수를 실행함으로
   * currentScene을 교체하게 된다.
   *
   * @typedef {Gameobject.constructor} sceneConstructor
   *
   * @param {sceneConstructor} sceneConstructor
   * @param {function} [callback=()=>{}]
   */
  static loadScene(sceneConstructor, callback = () => {}) {
    const newScene = new sceneConstructor();
    const changeScene = () => {
      SceneManager.changeScene(newScene);
      callback();
    };

    if (ResourceManager.getTotalResourceCount() === 0) {
      changeScene();
    } else {
      ResourceManager.setAllResourceLoadedCallback(changeScene);
    }
  }

  /**
   * currentScene에 다른 씬을 저장한다.
   * Engine에서 currentScene을 update, render하므로
   * 결과적으로는 씬이 교체된다.
   * 만약 리소스를 불러와야하는 객체가 포함된 씬이라면,
   * loadScene을 이용해야한다.
   *
   * @param {GameObject} scene - 저장할 씬 객체
   */
  static changeScene(scene) {
    SceneManager.currentScene = scene;
  }

  /**
   * 현재 엔진이 업데이트하고 있는 씬 객체를 반환한다.
   *
   * @returns {GameObject}
   */
  static getCurrentScene() {
    return SceneManager.currentScene;
  }
}

export default SceneManager;
