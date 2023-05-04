/*
 * object.destroy()를 실행하면 바로 삭제되는게 아니라,
 * 현재의 update가 종료된 후 큐에 등록된 오브젝트를 삭제한다.
 */
import SceneManager from "/src/engine/core/scene-manager.js";
import { findKeyInObjectWithValue } from "/src/engine/utils.js";

export default class DestroyManager {
  static objectQueue = new Array();
  constructor() {}

  static push(object) {
    DestroyManager.objectQueue.push(object);
  }

  static destroyAll() {
    while (DestroyManager.objectQueue.length > 0) {
      const object = DestroyManager.objectQueue.shift();
      // this.object 제거
      // scene 객체를 먼저 탐색한다.
      // 만약 scene 하위에 있는 객체에 선언되었다면
      // parent 내에서 this로 선언되어있을 것이다.
      // 따라서 scene과 parent만 탐색해도 된다.
      let key = findKeyInObjectWithValue(
        SceneManager.getCurrentScene(),
        object
      );
      if(key !== undefined) {
        delete SceneManager.getCurrentScene()[key];
      }

      key = findKeyInObjectWithValue(object.parent, object);
      if(key !== undefined) {
        delete object.parent[key];
      }

      // object.parent.childList에서 object제거
      const index = object.parent.childList.indexOf(object);
      if (index != -1) {
        object.parent.childList.splice(index, 1);
      }
    }
  }
}
