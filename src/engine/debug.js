import Engine from "/src/engine/engine.js";

class Debug {
  static addPauseToggleEventListener() {
    document.addEventListener("keydown", (event) => {
      if(event.ctrlKey && event.key === " "){
        Debug.togglePause();
      }
    })
  }

  static togglePause() {
    if(Engine.isPause) {
      Debug.resume();
    } else {
      Debug.pause();
    }
  }

  /**
   * 엔진이 일시정지 되어있다면 그 상태를 해제한다.
   */
  static resume() {
    Engine.isPause = false;
  }

  /**
   * 엔진을 일시정지한다.
   */
  static pause() {
    Engine.isPause = true;
  }
}

export default Debug;
