import {
  GameObject,
  InputManager,
  SceneManager,
  Text,
  Vector,
} from "/src/engine/module.js";

import TutorialScene10 from "../10-physics-engine/scene.js";

export default class TutorialScene12 extends GameObject {
  constructor() {
    super();
    this.addChild(
      new Text({
        text: "스페이스 키를 누르면 튜토리얼 10으로 이동합니다.",
        fontSize: 36,
        transform: {
          position: new Vector(100, 400),
        },
      })
    );
  }

  update(deltaTime) {
    if (InputManager.isKeyDown(" ")) {
      SceneManager.loadScene(TutorialScene10);
    }
  }
}

