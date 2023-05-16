import { GameObject, Text, Vector, InputManager } from "/src/engine/module.js";

export default class TutorialScene5 extends GameObject {
  constructor() {
    super();
    this.text = "텍스트를 줄바꿈하려면 printf처럼 사용하면 된다.";
    this.textObject = new Text({
      text: this.text,
      fontSize: 24,
      lineHeight: 24 * 1.25, // 줄 간격은 기본적으로 fontSize의 1.25배를 사용하도록 하고 있다.
      font: "consolas",
      transform: {
        position: new Vector(400, 300)
      }
    });
    this.addChild(this.textObject);
  }

  update(deltaTime) {
    super.update(deltaTime);
    if(InputManager.isKeyDown(" ")){
      this.text += "\n새로운 줄이 생성되었습니다.";
      this.textObject.setText(this.text);
    }
  }
}
