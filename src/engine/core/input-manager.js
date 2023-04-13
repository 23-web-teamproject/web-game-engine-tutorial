import Vector from "/src/engine/core/vector.js";

const KEY_STATUS = {
  UP: 0,
  DOWN: 1,
  RELEASED: 2,
  PRESSED: 3,
};

export default class InputManager {
  static keyTable = new Object();
  static keyStatus = new Object();
  static mousePosition = new Vector(0, 0);

  constructor() {
    this.buttonNameList = [
      "leftMouse",
      "middleMouse",
      "rightMouse",
      "mouse4",
      "mouse5",
    ]
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

    document.addEventListener("mousedown", (event) => {
      const buttonName = this.buttonNameList[event.button];
      if(!InputManager.isKeyInKeyTable()){
        InputManager.keyTable[buttonName] = new Array(false, false);
      }
      InputManager.keyTable[buttonName][0] = true;
    });

    document.addEventListener("mouseup", (event) => {
      const buttonName = this.buttonNameList[event.button];
      if(!InputManager.isKeyInKeyTable(buttonName)){
        InputManager.keyTable[buttonName] = new Array(false, false);
      }
      InputManager.keyTable[buttonName][0] = false;
    });

    document.addEventListener("mousemove", (event) => {
      InputManager.mousePosition.x = event.clientX;
      InputManager.mousePosition.y = event.clientY;
    });
  }

  update() {
    // update keyboard keys status.
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

  static getMousePos() {
    return InputManager.mousePosition;
  }
}
