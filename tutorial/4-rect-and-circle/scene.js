import { GameObject, Circle, Rect, Vector, Color } from "/src/engine/module.js";

export default class TutorialScene4 extends GameObject {
  constructor() {
    super();
    this.circle = new Circle({
      radius: 100,
      strokeColor: new Color(0, 255, 0, 0.5),
      transform: {
        position: new Vector(Math.random() * 1280, Math.random() * 720)
      }
    });
    this.addChild(this.circle);

    this.rect = new Rect({
      width: 100,
      height: 60,
      strokeWidth: 15, // strokeColor나 strokeWidth 속성을 설정하면 자동으로 윤곽선이 렌더링된다.
      transform: {
        position: new Vector(Math.random() * 1280, Math.random() * 720)
      }
    });
    this.addChild(this.rect);
  }
}
