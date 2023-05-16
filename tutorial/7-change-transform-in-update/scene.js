import { GameObject, Rect, Vector, InputManager } from "/src/engine/module.js";

import RotateRect from "./rotate-rect.js";

export default class TutorialScene7 extends GameObject {
  constructor() {
    super();
    this.rect = new Rect({
      width: 150,
      height: 150,
      transform: {
        position: new Vector(100, 100)
      }
    });
    this.addChild(this.rect);

    this.rotateRect = new RotateRect();
    this.addChild(this.rotateRect);
  }

  update(deltaTime) {
    super.update(deltaTime);
    if(InputManager.isKeyPressed("ArrowLeft")){
      this.rect.addPosition(new Vector(-100 * deltaTime, 0));
    }
    if(InputManager.isKeyPressed("ArrowRight")){
      this.rect.addPosition(new Vector(100 * deltaTime, 0));
    }
    if(InputManager.isKeyPressed("ArrowUp")){
      this.rect.addPosition(new Vector(0, -100 * deltaTime));
    }
    if(InputManager.isKeyPressed("ArrowDown")){
      this.rect.addPosition(new Vector(0, 100 * deltaTime));
    }
  }
}
