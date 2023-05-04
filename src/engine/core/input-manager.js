/*
 * 사용자가 어떤 키를 눌렀는지 또는 마우스의 위치를 알아야 할 때
 * 이 객체를 사용한다.
 * 엔진을 초기화 할 때 이벤트 리스너를 등록하여 매 프레임마다 입력을 받고
 * 키의 상태를 갱신하여 관리한다.
 */
import Vector from "/src/engine/data-structure/vector.js";

import RenderManager from "/src/engine/core/render-manager.js";

/*
 * 키의 상태를 나타내는 열거형이다.
 */
const KEY_STATUS = {
  UP: 0, // 키를 누르고 있지 않음을 말한다.
  DOWN: 1, // 키를 눌렀을 때를 말한다.
  RELEASED: 2, // 키를 꾹 누르고 있는 상태를 말한다.
  PRESSED: 3, // 키를 뗐을 때를 말함.
};

export default class InputManager {
  /*
   * 이전 프레임에서 키가 눌렸는가와
   * 현재 프레임에서 키가 눌렸는가를 저장할 테이블이다.
   */
  static keyTable = new Object();
  /*
   * keyTable을 이용해 현재 키의 상태(KEY_STATUS)를 저장할 테이블이다.
   */
  static keyStatus = new Object();
  /*
   * 마우스의 위치를 나타낸다.
   */
  static mousePosition = new Vector(0, 0);

  constructor() {
    this.buttonNameList = [
      "leftMouse",
      "middleMouse",
      "rightMouse",
      "mouse4",
      "mouse5",
    ];
    this.registerEventListener();
  }

  /*
   * 키 이벤트를 수신하여 keyTable를 갱신하는 함수를 이벤트 리스너에 등록한다.
   */
  registerEventListener() {
    document.addEventListener("keydown", (event) => {
      if (!InputManager.isKeyInKeyTable(event.key)) {
        InputManager.keyTable[event.key] = new Array(false, false);
      }
      InputManager.keyTable[event.key][0] = true;
    });

    document.addEventListener("keyup", (event) => {
      if (!InputManager.isKeyInKeyTable(event.key)) {
        InputManager.keyTable[event.key] = new Array(false, false);
      }
      InputManager.keyTable[event.key][0] = false;
    });

    document.addEventListener("mousedown", (event) => {
      const buttonName = this.buttonNameList[event.button];
      if (!InputManager.isKeyInKeyTable(buttonName)) {
        InputManager.keyTable[buttonName] = new Array(false, false);
      }
      InputManager.keyTable[buttonName][0] = true;
    });

    document.addEventListener("mouseup", (event) => {
      const buttonName = this.buttonNameList[event.button];
      if (!InputManager.isKeyInKeyTable(buttonName)) {
        InputManager.keyTable[buttonName] = new Array(false, false);
      }
      InputManager.keyTable[buttonName][0] = false;
    });

    // 마우스의 좌표는 브라우저를 기준으로 하지 않고
    // canvas를 기준으로 하기 때문에 정확한 계산을 위해 canvasPos를 뺀다.
    const mousePositionHandler = (event) => {
      const canvasPos = RenderManager.getRenderCanvas().getBoundingClientRect();
      InputManager.mousePosition.x = event.clientX - canvasPos.x;
      InputManager.mousePosition.y = event.clientY - canvasPos.y;
    };

    document.addEventListener("mousemove", mousePositionHandler);
  }

  /*
   * 매 프레임마다 update를 호출해 이전 프레임의 키의 상태와
   * 현재 프레임의 키의 상태를 조합하여 현재 키의 상태를 결정한다.
   *
   * 이전 프레임의 키의 상태 * 2 + 현재 프레임의 키의 상태
   *  = 현재 키의 상태
   *    key status in | key status in |
   *    previousFrame |  currentFrame |        result
   *   ---------------+---------------+-----------------------
   *         false(0) |      false(0) |      0 (KEY_UP)
   *   ---------------+---------------+-----------------------
   *         false(0) |       true(0) |      1 (KEY_DOWN)
   *   ---------------+---------------+-----------------------
   *          true(0) |       true(0) |      3 (KEY_PRESSED)
   *   ---------------+---------------+-----------------------
   *          true(0) |      false(0) |      2 (KEY_RELEASED)
   *
   *               KEY_DOWN              KEY_RELEASED
   * key down        |                       |
   *  status  -------*_______________________*------------
   *                ^ ^                     ^ ^
   *     --KEY_UP---' `-----KEY_PRESSED-----' `---KEY_UP--
   * 
   */
  update() {
    // update keyboard keys status.
    for (let key in InputManager.keyTable) {
      InputManager.keyStatus[key] =
        InputManager.keyTable[key][1] * 2 + InputManager.keyTable[key][0];
      InputManager.keyTable[key][1] = InputManager.keyTable[key][0];
    }
  }

  /*
   * 인자로 전달받은 키가 눌리지 않은 상태인지 반환한다.
   */
  static isKeyUp(key) {
    if (!InputManager.isKeyInKeyTable(key)) {
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.UP;
  }

  /*
   * 인자로 전달받은 키가 눌린 상태인지 반환한다.
   */
  static isKeyDown(key) {
    if (!InputManager.isKeyInKeyTable(key)) {
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.DOWN;
  }

  /*
   * 인자로 전달받은 키가 눌렸다가 뗀 상태인지 반환한다.
   */
  static isKeyReleased(key) {
    if (!InputManager.isKeyInKeyTable(key)) {
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.RELEASED;
  }

  /*
   * 인자로 전달받은 키가 꾹 눌린 상태인지 반환한다.
   */
  static isKeyPressed(key) {
    if (!InputManager.isKeyInKeyTable(key)) {
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.PRESSED;
  }

  /*
   * 인자로 전달받은 키가 keyTable에 존재하는지 반환한다.
   */
  static isKeyInKeyTable(key) {
    return InputManager.keyTable.hasOwnProperty(key);
  }

  /*
   * 인자로 전달받은 키가 눌리지 않은 상태인지 반환한다.
   */
  static getMousePos() {
    return InputManager.mousePosition;
  }
}
