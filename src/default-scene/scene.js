import { GameObject, Text, Color, Vector } from "/src/engine/module.js";

export default class ExampleScene extends GameObject {
  constructor() {
    super();
    this.text = new Text({
      color: new Color(0, 255, 0, 1),
      fontSize: 24,
      text: "",
      transform: {
        position: new Vector(100, 100),
      },
    });
    this.addChild(this.text);
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.text.setText(
      `엔진이 실행되었습니다.\n경과한 시간 ${(
        Math.round(performance.now() / 100) / 10
      ).toString()}초`
    );
  }
}
