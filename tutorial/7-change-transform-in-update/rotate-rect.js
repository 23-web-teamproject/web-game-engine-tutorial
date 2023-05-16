import { Rect, Vector, InputManager } from "/src/engine/module.js";

export default class RotateRect extends Rect {
  constructor() {
    super({
      width: 350,
      height: 100,
      transform: {
        position: new Vector(800, 500)
      }
    });
  }

  update(deltaTime) {
    super.update(deltaTime);
    if(InputManager.isKeyPressed("q")){
      this.addRotation(-45 * deltaTime);
    }
    if(InputManager.isKeyPressed("e")){
      this.addRotation(45 * deltaTime);
    }
  }
}
