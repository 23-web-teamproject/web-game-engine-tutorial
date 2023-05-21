import { GameObject, InputManager, Text, Vector } from "/src/engine/module.js";

export default class TutorialScene11 extends GameObject {
  constructor() {
    super();
    this.text = new Text({
      text: "Space키를 누르면 제거됩니다. \n한 번 더 누른다면 에러가 나옵니다!",
      fontSize: 36,
      transform: {
        position: new Vector(200, 400),
      },
    });
    this.addChild(this.text);
  }

  update(deltaTime) {
    if (InputManager.isKeyDown(" ")) {
      this.text.destroy();
    }
  }
}
