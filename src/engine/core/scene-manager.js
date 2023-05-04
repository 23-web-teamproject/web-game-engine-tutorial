/*
 * 씬 객체를 다루는 책임을 맡는다.
 * 엔진 내에서 씬을 교체한다거나 현재 씬 객체를 반환하는 일을 한다.
 *
 * 씬 객체란, 게임 캐릭터나 이펙트, 애니메이션 등 게임 내에서 등장하는
 * 모든 오브젝트들의 최상위 오브젝트를 말한다.
 * 씬 객체는 모든 게임 오브젝트를 통제하여 게임의 로직을 설계하고 관리하게 된다.
 */
export default class SceneManager {
  static currentScene = undefined;

  constructor() {}

  /*
   * currentScene에 새로운 씬을 생성해 저장한다.
   * 엔진에서는 매 프레임마다 이 currentScene를 참조해
   * update와 render를 실행하므로, 씬이 변경된 효과가 나타난다.
   */
  static changeScene(targetScene) {
    SceneManager.currentScene = new targetScene();
  }

  /*
   * 현재 엔진이 업데이트하고 있는 씬 객체를 반환한다.
   */
  static getCurrentScene() {
    return SceneManager.currentScene;
  }
}
