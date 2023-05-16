import { GameObject, Sprite, Vector } from "/src/engine/module.js";

import Path from "/src/engine/utils/path.js";

export default class TutorialScene6 extends GameObject {
  constructor() {
    super();
    Path.setAssetFolderPath(import.meta.url); // 이 코드가 없으면 상대경로로 불러올 수 없습니다.
    // Path.setAssetFolderPath("/src/tutorial/6-sprite/"); // import.meta.url 대신 직접 절대경로로 지정할 수 있습니다.
    this.sprite = new Sprite({
      imagePath: "squirrel.jpg",
      transform: {
        position: new Vector(600,300)
      }
    });
    this.addChild(this.sprite);
  }
}
