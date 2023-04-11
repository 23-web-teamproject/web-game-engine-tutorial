const KEY_STATUS = {
  UP: 0,
  DOWN: 1,
  RELEASED: 2,
  PRESSED: 3,
};

export default class InputManager {
  static keyTable = new Object();
  static keyStatus = new Object();

  constructor() {
    this.registerEventListener();
  }

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
  }

  update() {
    for (let key in InputManager.keyTable) {
      InputManager.keyStatus[key] = InputManager.keyTable[key][1] * 2 + InputManager.keyTable[key][0];
      InputManager.keyTable[key][1] = InputManager.keyTable[key][0];
    }
  }
  
  static isKeyUp(key){
    if(!InputManager.isKeyInKeyTable(key)){
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.UP;
  }
  
  static isKeyDown(key){
    if(!InputManager.isKeyInKeyTable(key)){
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.DOWN;
  }

  static isKeyReleased(key){
    if(!InputManager.isKeyInKeyTable(key)){
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.RELEASED;
  }

  static isKeyPressed(key){
    if(!InputManager.isKeyInKeyTable(key)){
      return false;
    }
    return InputManager.keyStatus[key] == KEY_STATUS.PRESSED;
  }
  
  static isKeyInKeyTable(key) {
    return InputManager.keyTable.hasOwnProperty(key);
  }
}
