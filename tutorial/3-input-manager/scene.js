import { GameObject, InputManager } from "/src/engine/module.js";

export default class TutorialScene3 extends GameObject {
  constructor() {
    super();
  }

  update(deltaTime) {
    super.update(deltaTime);
    if(InputManager.isKeyDown("leftMouse")) {
      console.log("left mouse is down!");
    }
    if(InputManager.isKeyPressed("leftMouse")) {
      console.log("left mouse is pressed!");
    }
    if(InputManager.isKeyReleased("leftMouse")) {
      console.log("left mouse is released!");
    }
    if(InputManager.isKeyDown(" ")) {
      console.log("space key is down!");
    }
    if(InputManager.isKeyPressed(" ")) {
      console.log("space key is pressed!");
    }
    if(InputManager.isKeyReleased(" ")) {
      console.log("space key is released!");
    }
  }
}
