import { GameObject, SoundEffect, Text, Vector, InputManager } from "/src/engine/module.js";

export default class TutorialScene8 extends GameObject {
  constructor() {
    super();
    this.text = new Text({
      text: "space키를 눌러 일시정지/재생할 수 있습니다.",
      fontSize: 24,
      transform: {
        position: new Vector(100, 100)
      }
    });
    this.addChild(this.text);

    this.isSoundOn = true;
    this.sound = new SoundEffect("/src/tutorial/8-sound-effect/source.mp3");
    this.sound.play();
  }

  update(deltaTime) {
    super.update(deltaTime);
    if(InputManager.isKeyDown(" ")){
      if(this.isSoundOn) {
        this.sound.pause();
      } else {
        this.sound.play();
      }
      this.isSoundOn = !this.isSoundOn;
    }
  }
}
