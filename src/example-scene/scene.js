import { GameObject, Sprite, InputManager, SoundFx } from "/src/engine/core.js";

class ExampleScene extends GameObject {
  constructor() {
    // 무조건 부모 생성자를 호출해야함.
    // 안하면 this를 사용할 수 없다.
    super();

    this.sprite = new Sprite("/src/example-scene/sample.jpg");
    this.childSprite = new Sprite("/src/example-scene/sample.jpg");
    this.addChild(this.sprite);
    this.sprite.addChild(this.childSprite);
    this.childSprite.setScale(0.5,0.5);
    this.speed = 300;
    this.effect = new SoundFx("/src/example-scene/fx.wav");
  }
  
  update(deltaTime) {
    // 부모의 update를 호출해야만 이 GameObject에 등록된
    // 하위 GameObject들이 update된다.
    // super.update()를 쓰지 않으면 
    // 씬 속의 gameObject의 게임 로직이 작동하지 않는다.
    super.update(deltaTime);
    if (InputManager.isKeyDown(" ")) {
      this.sprite.removeChild(this.childSprite);
      this.effect.stop();
    }
    if (InputManager.isKeyDown("b")) {
      this.sprite.addChild(this.childSprite);
      this.effect.play();
    }
    if (InputManager.isKeyPressed("a")) {
      this.sprite.addPos(-this.speed * deltaTime, 0);
    }
    if (InputManager.isKeyPressed("d")) {
      this.sprite.addPos(this.speed * deltaTime, 0);
    }
    if (InputManager.isKeyPressed("w")) {
      this.sprite.addPos(0, -this.speed * deltaTime);
    }
    if (InputManager.isKeyPressed("s")) {
      this.sprite.addPos(0, this.speed * deltaTime);
    }
    if (InputManager.isKeyPressed("q")) {
      this.sprite.addRotation(90 * deltaTime);
    }
    if (InputManager.isKeyPressed("e")) {
      this.sprite.addRotation(-90 * deltaTime);
    }
    if (InputManager.isKeyPressed("z")) {
      this.sprite.addScale(1 * deltaTime, 1 * deltaTime);
    }
    if (InputManager.isKeyPressed("x")) {
      this.sprite.addScale(-1 * deltaTime, -1 * deltaTime);
    }
    // 클라이언트의 진짜 크기와 화면상 좌표값을 반환
    // console.log(this.sprite.element.getBoundingClientRect());
  }

  render() {
    // update에 의해 변경된 값들을 css에 적용시킨다.
    // super.render()를 호출하지 않으면 씬 속의 게임오브젝트들이 화면에 표시되지 않는다.
    super.render();
  }
}

export default ExampleScene;
