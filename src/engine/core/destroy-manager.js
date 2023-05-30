import SceneManager from "/src/engine/core/scene-manager.js";

import { findKeyInObjectWithValue } from "/src/engine/utils.js";

/**
 * JS에는 클래스를 삭제하는 예약어가 따로 없다.
 * 단지 어떤 변수를 아무도 참조하지 않을 때 가비지 컬렉터(GC)가
 * 자동으로 수집해 제거한다.
 *
 * 그러므로 어떤 객체를 제거하기 위해서는 그 객체를
 * 어느 누구도 참조하지 않으면 된다.
 * 따라서 그 객체의 자식객체들을 모두 삭제하고,
 * 부모의 어느 프로퍼티에서도 이 객체가 존재하지 않도록 만들면 된다.
 *
 * object.destroy()를 실행하면 바로 삭제되는게 아니라,
 * 현재의 update가 종료된 후 큐에 등록된 오브젝트를 삭제한다.
 */
class DestroyManager {
  /**
   * 삭제되길 기다리는 객체들을 저장한 큐
   *
   * @property {GameObject[]}
   * @static
   */
  static objectQueue = new Array();

  constructor() {}

  /**
   * 큐에 객체를 넣는다.
   *
   * @param {GameObject} object - 삭제될 객체
   */
  static push(object) {
    DestroyManager.objectQueue.push(object);
  }

  /**
   * 큐가 빌 때까지 큐에 들어있는 객체를 삭제한다.
   * 삭제한다는 말은 그 객체를 참조하는 값을 모두 지운다는 말이다.
   */
  static destroyAll() {
    while (DestroyManager.objectQueue.length > 0) {
      const object = DestroyManager.objectQueue.shift();
      // 씬 객체에 이 객체가 등록되어 있는지 확인한다.
      let key = findKeyInObjectWithValue(
        SceneManager.getCurrentScene(),
        object
      );
      if (key !== undefined) {
        delete SceneManager.getCurrentScene()[key];
      }

      // 이 객체의 parent에 이 객체가 등록되어 있는지 확인한다.
      key = findKeyInObjectWithValue(object.parent, object);
      if (key !== undefined) {
        delete object.parent[key];
      }

      // 이 객체의 부모의 childList에서 이 객체를 제거한다.
      const index = object.parent.childList.indexOf(object);
      if (index != -1) {
        object.parent.childList.splice(index, 1);
      }
    }
  }
}

export default DestroyManager;
